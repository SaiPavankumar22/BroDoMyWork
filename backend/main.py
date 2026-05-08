import os
import glob
import uuid
import logging
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load .env before anything reads environment variables
load_dotenv()

from services.ocr_service import OCRService
from services.llm_service import LLMService
from services.handwriting_service import HandwritingService
from services.pdf_service import PDFService
from models.schemas import (
    QuestionExtractionResponse,
    AnswerGenerationRequest,
    AnswerGenerationResponse,
    RenderAssignmentRequest,
    RenderAssignmentResponse,
    ProcessingStatus,
)

# ── Config from environment ──────────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = str((BASE_DIR / os.getenv("OUTPUT_DIR", "output")).resolve())
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024)))  # 10 MB default

TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")
if TESSERACT_CMD:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Assignment Writer API",
    description="Backend API for AI-powered handwritten assignment generation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Services ─────────────────────────────────────────────────────────────────
ocr_service = OCRService()
llm_service = LLMService()
handwriting_service = HandwritingService()
pdf_service = PDFService()

# In-memory session store (use Redis in production)
processing_status: dict = {}


# ── Helpers ───────────────────────────────────────────────────────────────────
def update_status(session_id: str, step: str, progress: int, message: str) -> None:
    if session_id in processing_status:
        processing_status[session_id].update(
            step=step,
            progress=progress,
            message=message,
            updated_at=datetime.now().isoformat(),
        )


def _delete_session_files(session_id: str, pdf_path: str | None = None) -> None:
    """Remove all files associated with a session."""
    # Delete page PNGs
    for png in glob.glob(os.path.join(OUTPUT_DIR, f"{session_id}_page_*.png")):
        try:
            os.remove(png)
        except OSError:
            pass
    # Delete PDF
    target = pdf_path or os.path.join(OUTPUT_DIR, f"{session_id}_*.pdf")
    for f in glob.glob(target) if "*" in (target or "") else [target]:
        try:
            if os.path.exists(f):
                os.remove(f)
        except OSError:
            pass


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "AI Assignment Writer API", "status": "running", "version": "1.0.0"}


@app.post("/api/upload", response_model=QuestionExtractionResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and process assignment file (PDF/Image) using OCR."""
    allowed = {"application/pdf", "image/jpeg", "image/png", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB.",
        )

    session_id = str(uuid.uuid4())
    processing_status[session_id] = {
        "status": "processing",
        "step": "extract",
        "progress": 10,
        "message": "Extracting text from document…",
    }

    try:
        extracted_text = await ocr_service.extract_text(file_content, file.content_type)
        questions = await ocr_service.segment_questions(extracted_text)

        processing_status[session_id].update(
            status="completed", step="extract", progress=100,
            message="Text extraction completed",
        )

        return QuestionExtractionResponse(
            session_id=session_id,
            extracted_text=extracted_text,
            questions=questions,
            question_count=len(questions),
        )
    except Exception as exc:
        processing_status[session_id].update(status="error", message=str(exc))
        logger.error("upload_file error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")


@app.post("/api/generate-answers", response_model=AnswerGenerationResponse)
async def generate_answers(request: AnswerGenerationRequest):
    """Generate human-like answers using LLM."""
    processing_status[request.session_id] = {
        "status": "processing",
        "step": "generate",
        "progress": 0,
        "message": "Analyzing questions…",
    }

    try:
        answers = await llm_service.generate_answers(
            questions=request.questions,
            subject=request.subject,
            difficulty_level=request.difficulty_level,
            writing_style=request.writing_style,
            session_id=request.session_id,
            status_callback=lambda p, m: update_status(request.session_id, "generate", p, m),
        )

        processing_status[request.session_id].update(
            status="completed", step="generate", progress=100,
            message="Answer generation completed",
        )

        return AnswerGenerationResponse(
            session_id=request.session_id,
            answers=answers,
            total_answers=len(answers),
        )
    except Exception as exc:
        processing_status[request.session_id].update(status="error", message=str(exc))
        logger.error("generate_answers error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Answer generation failed: {exc}")


@app.post("/api/render-assignment", response_model=RenderAssignmentResponse)
async def render_assignment(request: RenderAssignmentRequest):
    """Render answers in handwriting style and generate PDF."""
    processing_status[request.session_id] = {
        "status": "processing",
        "step": "render",
        "progress": 0,
        "message": "Rendering handwritten assignment…",
    }

    try:
        page_images = await handwriting_service.render_assignment(
            questions_and_answers=request.questions_and_answers,
            template=request.template,
            font_style=request.font_style,
            name=request.name,
            roll_number=request.roll_number,
            session_id=request.session_id,
            status_callback=lambda p, m: update_status(request.session_id, "render", p, m),
        )

        safe_name = "".join(c for c in request.name if c.isalnum() or c in "._- ").strip()
        pdf_path = await pdf_service.create_pdf(
            page_images=page_images,
            session_id=request.session_id,
            filename=f"{safe_name}_Assignment.pdf",
        )
        preview_images = [
            f"/api/preview/{request.session_id}/{index + 1}"
            for index in range(len(page_images))
        ]

        processing_status[request.session_id].update(
            status="completed",
            step="render",
            progress=100,
            message="Assignment rendering completed",
            pdf_path=pdf_path,
            page_count=len(page_images),
            preview_images=preview_images,
            page_images=page_images,
            font_used=handwriting_service.last_font_used,
            warnings=handwriting_service.last_warnings,
        )

        return RenderAssignmentResponse(
            session_id=request.session_id,
            pdf_path=pdf_path,
            page_count=len(page_images),
            download_url=f"/api/download/{request.session_id}",
            preview_images=preview_images,
            font_used=handwriting_service.last_font_used,
            warnings=handwriting_service.last_warnings,
        )
    except Exception as exc:
        processing_status[request.session_id].update(status="error", message=str(exc))
        logger.error("render_assignment error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Rendering failed: {exc}")


@app.get("/api/status/{session_id}", response_model=ProcessingStatus)
async def get_processing_status(session_id: str):
    """Get current processing status for a session."""
    if session_id not in processing_status:
        raise HTTPException(status_code=404, detail="Session not found")
    return ProcessingStatus(**processing_status[session_id])


@app.get("/api/download/{session_id}")
async def download_assignment(session_id: str):
    """Download the generated PDF assignment."""
    if session_id not in processing_status:
        raise HTTPException(status_code=404, detail="Session not found")

    status = processing_status[session_id]
    if status.get("status") != "completed" or "pdf_path" not in status:
        raise HTTPException(status_code=400, detail="Assignment not ready for download")

    pdf_path = status["pdf_path"]
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path),
    )


@app.get("/api/preview/{session_id}/{page_number}")
async def preview_assignment_page(session_id: str, page_number: int):
    """Serve a rendered page preview image."""
    status = processing_status.get(session_id)
    if not status:
        raise HTTPException(status_code=404, detail="Session not found")

    page_images = status.get("page_images") or []
    if page_number < 1 or page_number > len(page_images):
        raise HTTPException(status_code=404, detail="Preview page not found")

    image_path = page_images[page_number - 1]
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Preview image missing on disk")

    return FileResponse(image_path, media_type="image/png")


@app.delete("/api/cleanup/{session_id}")
async def cleanup_session(session_id: str):
    """Clean up session files and data."""
    try:
        pdf_path = None
        if session_id in processing_status:
            pdf_path = processing_status[session_id].get("pdf_path")
            del processing_status[session_id]

        _delete_session_files(session_id, pdf_path)
        return {"message": "Session cleaned up successfully"}
    except Exception as exc:
        logger.error("cleanup_session error: %s", exc)
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {exc}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=DEBUG)
