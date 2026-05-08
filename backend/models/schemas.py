from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class WritingStyle(str, Enum):
    CASUAL = "casual"
    FORMAL = "formal"
    ACADEMIC = "academic"
    CREATIVE = "creative"

class TemplateType(str, Enum):
    RULED = "ruled"
    DOUBLE_RULED = "double-ruled"
    BLANK = "blank"
    NOTEBOOK = "notebook"
    GRAPH = "graph"
    DOTTED = "dotted"

class FontStyle(str, Enum):
    CAVEAT = "caveat"
    DANCING = "dancing"
    PATRICK = "patrick"
    INDIE = "indie"
    KALAM = "kalam"
    SHADOWS = "shadows"

class QuestionExtractionResponse(BaseModel):
    session_id: str
    extracted_text: str
    questions: List[str]
    question_count: int

class AnswerGenerationRequest(BaseModel):
    session_id: str
    questions: List[str]
    subject: Optional[str] = "General"
    difficulty_level: DifficultyLevel = DifficultyLevel.INTERMEDIATE
    writing_style: WritingStyle = WritingStyle.CASUAL

class GeneratedAnswer(BaseModel):
    question: str
    answer: str
    word_count: int
    confidence_score: float

class AnswerGenerationResponse(BaseModel):
    session_id: str
    answers: List[GeneratedAnswer]
    total_answers: int

class QuestionAnswer(BaseModel):
    question: str
    answer: str

class RenderAssignmentRequest(BaseModel):
    session_id: str
    questions_and_answers: List[QuestionAnswer]
    template: TemplateType
    font_style: FontStyle
    name: str
    roll_number: str

class RenderAssignmentResponse(BaseModel):
    session_id: str
    pdf_path: str
    page_count: int
    download_url: str
    preview_images: List[str] = []
    font_used: Optional[str] = None
    warnings: List[str] = []

class ProcessingStatus(BaseModel):
    status: str  # "processing", "completed", "error"
    step: str    # "extract", "analyze", "generate", "render"
    progress: int
    message: str
    pdf_path: Optional[str] = None
    page_count: Optional[int] = None
    updated_at: Optional[str] = None
