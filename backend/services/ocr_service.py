import io
import re
import logging
from typing import List

import pytesseract
import cv2
import numpy as np
from PIL import Image

# PDF text extraction (embedded / digital PDFs – no Poppler needed)
from pypdf import PdfReader

# PDF → high-res images (no Poppler needed)
import fitz  # PyMuPDF

# Table extraction from PDFs
import pdfplumber

import spacy

logger = logging.getLogger(__name__)

# Minimum characters of embedded text before we trust it and skip OCR
_MIN_EMBEDDED_CHARS = 50

# Render resolution: 2× zoom ≈ 144 DPI, good balance of quality vs. speed
_RENDER_ZOOM = 2.0


class OCRService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
            self.nlp = None

    # ── Public API ────────────────────────────────────────────────────────────

    async def extract_text(self, file_content: bytes, content_type: str) -> str:
        """Extract text from a PDF or image file."""
        try:
            if content_type == "application/pdf":
                return await self._extract_from_pdf(file_content)
            return await self._extract_from_image(file_content)
        except Exception as exc:
            logger.error("OCR extraction failed: %s", exc)
            raise Exception(f"Text extraction failed: {exc}") from exc

    # ── PDF extraction ────────────────────────────────────────────────────────

    async def _extract_from_pdf(self, pdf_content: bytes) -> str:
        """
        Two-stage PDF extraction:
        1. Try pypdf for embedded (digital) text – instant, no Poppler.
        2. If the PDF is scanned / image-only, render pages with PyMuPDF
           and run Tesseract OCR on each page image.
        Also extracts any tables found by pdfplumber and appends them.
        """
        # Stage 1 — direct text via pypdf
        embedded_text = self._extract_embedded_text(pdf_content)
        table_text = self._extract_tables(pdf_content)

        if len(embedded_text.strip()) >= _MIN_EMBEDDED_CHARS:
            logger.info("PDF has embedded text – skipping OCR")
            combined = embedded_text
            if table_text:
                combined += f"\n\n--- Tables ---\n{table_text}"
            return combined.strip()

        # Stage 2 — scanned PDF: render via PyMuPDF → Tesseract
        logger.info("PDF appears scanned – using PyMuPDF + Tesseract OCR")
        ocr_text = self._ocr_pdf_pages(pdf_content)

        combined = ocr_text
        if table_text:
            combined += f"\n\n--- Tables ---\n{table_text}"
        return combined.strip()

    def _extract_embedded_text(self, pdf_content: bytes) -> str:
        """Extract embedded text from a PDF using pypdf."""
        try:
            reader = PdfReader(io.BytesIO(pdf_content))
            parts: List[str] = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    parts.append(f"\n--- Page {i + 1} ---\n{page_text}")
            return "\n".join(parts)
        except Exception as exc:
            logger.warning("pypdf text extraction failed: %s", exc)
            return ""

    def _extract_tables(self, pdf_content: bytes) -> str:
        """Extract tables from a PDF using pdfplumber and convert to text."""
        try:
            table_parts: List[str] = []
            with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    tables = page.extract_tables()
                    for t_idx, table in enumerate(tables):
                        rows = [
                            " | ".join(cell or "" for cell in row)
                            for row in table
                            if any(cell for cell in row)
                        ]
                        if rows:
                            table_parts.append(
                                f"[Page {page_num}, Table {t_idx + 1}]\n" + "\n".join(rows)
                            )
            return "\n\n".join(table_parts)
        except Exception as exc:
            logger.warning("pdfplumber table extraction failed: %s", exc)
            return ""

    def _ocr_pdf_pages(self, pdf_content: bytes) -> str:
        """Render each PDF page to an image with PyMuPDF, then OCR with Tesseract."""
        try:
            doc = fitz.open(stream=pdf_content, filetype="pdf")
            mat = fitz.Matrix(_RENDER_ZOOM, _RENDER_ZOOM)
            extracted = ""

            for i, page in enumerate(doc):
                pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
                img_bytes = pix.tobytes("png")
                pil_image = Image.open(io.BytesIO(img_bytes))

                processed = self._preprocess_image(pil_image)
                page_text = pytesseract.image_to_string(
                    processed,
                    config="--psm 6 --oem 3",
                )
                extracted += f"\n--- Page {i + 1} ---\n{page_text}\n"

            doc.close()
            return extracted.strip()

        except Exception as exc:
            logger.error("PyMuPDF/Tesseract OCR failed: %s", exc)
            raise Exception(f"PDF OCR failed: {exc}") from exc

    # ── Image extraction ──────────────────────────────────────────────────────

    async def _extract_from_image(self, image_content: bytes) -> str:
        """Extract text from a standalone image using Tesseract OCR."""
        try:
            image = Image.open(io.BytesIO(image_content))
            processed = self._preprocess_image(image)
            text = pytesseract.image_to_string(processed, config="--psm 6 --oem 3")
            return text.strip()
        except Exception as exc:
            logger.error("Image OCR failed: %s", exc)
            raise Exception(f"Image processing failed: {exc}") from exc

    # ── Image pre-processing ──────────────────────────────────────────────────

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Convert to greyscale, denoise, and binarise for better OCR accuracy."""
        try:
            opencv_image = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            kernel = np.ones((1, 1), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            return Image.fromarray(cleaned)
        except Exception as exc:
            logger.warning("Image preprocessing failed, using original: %s", exc)
            return image

    # ── Question segmentation ─────────────────────────────────────────────────

    async def segment_questions(self, text: str) -> List[str]:
        """Segment extracted text into individual questions."""
        try:
            cleaned = self._clean_text(text)
            questions: List[str] = []

            # Strategy 1: numbered / prefixed question patterns
            patterns = [
                r'(?:^|\n)\s*(?:Q\.?\s*\d+\.?|Question\s*\d+\.?|\d+\.)\s*(.+?)(?=(?:^|\n)\s*(?:Q\.?\s*\d+\.?|Question\s*\d+\.?|\d+\.)|$)',
                r'(?:^|\n)\s*(?:[A-Z]\)|[a-z]\)|\([a-z]\)|\([A-Z]\))\s*(.+?)(?=(?:^|\n)\s*(?:[A-Z]\)|[a-z]\)|\([a-z]\)|\([A-Z]\))|$)',
                r'(?:^|\n)\s*([A-Z][^.!?]*\?)',
                r'(?:^|\n)\s*([^.!?]*(?:what|how|why|when|where|which|who)[^.!?]*\?)',
            ]
            for pattern in patterns:
                for match in re.finditer(pattern, cleaned, re.MULTILINE | re.IGNORECASE | re.DOTALL):
                    q = match.group(1).strip()
                    if len(q) > 10 and q not in questions:
                        questions.append(q)

            # Strategy 2: spaCy sentence segmentation
            if self.nlp and not questions:
                doc = self.nlp(cleaned)
                for sent in doc.sents:
                    sentence = sent.text.strip()
                    if self._is_likely_question(sentence):
                        questions.append(sentence)

            # Strategy 3: delimiter-based fallback
            if not questions:
                for chunk in re.split(r'\n\s*\n|\d+\.\s*|\n(?=[A-Z])', cleaned):
                    chunk = chunk.strip()
                    if len(chunk) > 20:
                        questions.append(chunk)

            final: List[str] = []
            seen: set[str] = set()
            for q in questions:
                cq = self._clean_question(q)
                normalized = re.sub(r"\s+", " ", cq).strip().lower()
                if cq and len(cq) > 10 and normalized not in seen:
                    seen.add(normalized)
                    final.append(cq)

            return final[:20]

        except Exception as exc:
            logger.error("Question segmentation failed: %s", exc)
            return [text.strip()] if text.strip() else []

    # ── Text helpers ──────────────────────────────────────────────────────────

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'--- Page \d+ ---', '', text)
        text = re.sub(r'--- Tables? ---.*', '', text, flags=re.DOTALL)
        text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(?:Name|Roll No|Roll Number|Subject)\s*:\s*[^\n]+', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        text = re.sub(r'[^\w\s\.\?\!\,\;\:\-\(\)\[\]\'\"]+', ' ', text)
        return text.strip()

    def _clean_question(self, question: str) -> str:
        question = re.sub(r'^(?:Q\.?\s*\d+\.?|Question\s*\d+\.?|\d+\.)\s*', '', question)
        question = re.sub(r'\s+', ' ', question).strip()
        if question and not question.endswith(('?', '.', '!', ':')):
            wh = ['what', 'how', 'why', 'when', 'where', 'which', 'who']
            question += '?' if any(w in question.lower() for w in wh) else '.'
        return question

    def _is_likely_question(self, text: str) -> bool:
        text_lower = text.lower()
        has_qword = any(w in text_lower for w in ['what', 'how', 'why', 'when', 'where', 'which', 'who', 'whose', 'whom'])
        has_qmark = '?' in text
        has_imperative = any(p in text_lower for p in ['explain', 'describe', 'discuss', 'analyze', 'compare', 'define', 'list'])
        return len(text.strip()) > 10 and (has_qword or has_qmark or has_imperative)
