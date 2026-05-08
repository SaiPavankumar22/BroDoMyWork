const API_BASE = '/api';

export interface UploadResponse {
  session_id: string;
  extracted_text: string;
  questions: string[];
  question_count: number;
}

export interface GeneratedAnswer {
  question: string;
  answer: string;
  word_count: number;
  confidence_score: number;
}

export interface AnswerGenerationResponse {
  session_id: string;
  answers: GeneratedAnswer[];
  total_answers: number;
}

export interface RenderResponse {
  session_id: string;
  pdf_path: string;
  page_count: number;
  download_url: string;
  preview_images: string[];
  font_used?: string;
  warnings?: string[];
}

export interface ProcessingStatus {
  status: string;
  step: string;
  progress: number;
  message: string;
  pdf_path?: string;
  page_count?: number;
  updated_at?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) message = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<UploadResponse>(response);
}

export async function generateAnswers(
  sessionId: string,
  questions: string[],
  subject: string = 'General',
  difficultyLevel: string = 'intermediate',
  writingStyle: string = 'casual'
): Promise<AnswerGenerationResponse> {
  const response = await fetch(`${API_BASE}/generate-answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      questions,
      subject,
      difficulty_level: difficultyLevel,
      writing_style: writingStyle,
    }),
  });
  return handleResponse<AnswerGenerationResponse>(response);
}

export async function renderAssignment(
  sessionId: string,
  questionsAndAnswers: Array<{ question: string; answer: string }>,
  template: string,
  fontStyle: string,
  name: string,
  rollNumber: string
): Promise<RenderResponse> {
  const response = await fetch(`${API_BASE}/render-assignment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      questions_and_answers: questionsAndAnswers,
      template,
      font_style: fontStyle,
      name,
      roll_number: rollNumber,
    }),
  });
  return handleResponse<RenderResponse>(response);
}

export async function getStatus(sessionId: string): Promise<ProcessingStatus> {
  const response = await fetch(`${API_BASE}/status/${sessionId}`);
  return handleResponse<ProcessingStatus>(response);
}

export function getDownloadUrl(sessionId: string): string {
  return `${API_BASE}/download/${sessionId}`;
}

export async function cleanupSession(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/cleanup/${sessionId}`, { method: 'DELETE' });
  } catch {
    // best-effort cleanup
  }
}
