# AssignmentAI

Convert any assignment **PDF/image** into a clean **handwritten-style PDF** using OCR + AI answer generation + handwriting rendering.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=000)](#)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=fff)](#)
[![Language](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=fff)](#)
[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=fff)](#)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=fff)](#)
[![PDF](https://img.shields.io/badge/PDF-PyMuPDF%20%2B%20pypdf%20%2B%20pdfplumber-6b7280)](#)

---

## What it does

- **Upload** a PDF or image (JPG/PNG)
- **Extract questions**
  - Digital PDFs: extract embedded text using **pypdf**
  - Scanned PDFs: render pages to images with **PyMuPDF**, then OCR with **Tesseract**
  - Tables: extract with **pdfplumber** (added to the extracted text)
- **Generate answers** with OpenAI (subject + difficulty + style)
- **Render handwriting** pages (template + handwriting font)
- **Download** the final PDF

---

## Tech stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, Uvicorn
- **PDF/OCR pipeline**:
  - **pypdf**: simple text extraction from digital PDFs
  - **PyMuPDF**: PDF → images (no Poppler needed)
  - **pdfplumber**: table extraction
  - **Tesseract** + OpenCV: OCR for scanned PDFs/images
- **Handwriting/PDF output**: Pillow (PIL), img2pdf, reportlab
- **NLP**: spaCy

---

## Quick start (local dev)

### Requirements

- **Node.js 18+**
- **Python 3.10+** (recommended **3.11**)
- **Tesseract OCR**
  - Install guide: [tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)
  - If Tesseract isn’t on PATH, set `TESSERACT_CMD` in `backend/.env`
- **OpenAI API key**
- **Poppler is NOT required** (we do not use `pdf2image`)

---

### Backend (FastAPI)

#### Windows (PowerShell)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
copy .env.example .env
# edit backend/.env and set OPENAI_API_KEY
python setup_fonts.py
uvicorn main:app --reload --port 8000
```

#### macOS/Linux

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env
# edit backend/.env and set OPENAI_API_KEY
python setup_fonts.py
uvicorn main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

---

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

**Dev proxy:** the frontend proxies `/api/*` to `http://localhost:8000` via `frontend/vite.config.ts`.

---

## Environment variables (backend/.env)

| Variable | Default | What it controls |
|---|---:|---|
| `OPENAI_API_KEY` | *(required)* | OpenAI API key |
| `HOST` | `0.0.0.0` | Uvicorn bind host |
| `PORT` | `8000` | Uvicorn port |
| `DEBUG` | `false` | Debug logging + reload mode when running `python main.py` |
| `OUTPUT_DIR` | `output` | Where PDFs (and temporary PNGs) are stored |
| `MAX_FILE_SIZE` | `10485760` | Upload limit (bytes) |
| `TESSERACT_CMD` | *(PATH)* | Full path to Tesseract executable |

---

## Docker (backend only)

```bash
cd backend
docker build -t assignmentai-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... assignmentai-backend
```

---

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/upload` | Upload PDF/image → extracted text + questions + `session_id` |
| `POST` | `/api/generate-answers` | Generate AI answers for provided questions |
| `POST` | `/api/render-assignment` | Render handwriting pages → PDF |
| `GET` | `/api/status/{session_id}` | Check status/progress |
| `GET` | `/api/download/{session_id}` | Download generated PDF |
| `DELETE` | `/api/cleanup/{session_id}` | Remove session + files |

---

## Handwriting fonts (recommended)

The app renders handwriting using Google handwriting fonts downloaded into `backend/assets/fonts/`.

```bash
cd backend
python setup_fonts.py
```

If fonts are missing, the backend falls back to a default PIL font (works, but looks less realistic).

Supported font styles: **Caveat**, **Dancing Script**, **Patrick Hand**, **Indie Flower**, **Kalam**, **Shadows Into Light**

---

## Troubleshooting

### “Backend server not reachable” in the UI

- Make sure the backend is running:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Tesseract not found / OCR fails

- Install Tesseract and ensure it’s on PATH, or set:
  - `TESSERACT_CMD` in `backend/.env` (full path to `tesseract.exe`)

### PDFs don’t extract correctly

- Digital PDFs: handled by **pypdf** (best effort)
- Scanned PDFs: handled by **PyMuPDF render → Tesseract OCR**
- If quality is low, use clearer scans and higher resolution originals

---

## Project structure

```
.
├── backend/
│   ├── main.py                       # FastAPI app + routes + env wiring
│   ├── models/schemas.py             # Pydantic request/response models
│   ├── services/
│   │   ├── ocr_service.py            # pypdf + PyMuPDF + Tesseract + pdfplumber
│   │   ├── llm_service.py            # OpenAI answer generation
│   │   ├── handwriting_service.py    # PIL handwriting rendering
│   │   └── pdf_service.py            # img2pdf PDF assembly
│   ├── assets/fonts/                 # Handwriting fonts (TTF)
│   ├── output/                       # Generated PDFs (gitignored)
│   ├── setup_fonts.py                # Downloads handwriting fonts
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Wizard state + props wiring
│   │   ├── services/api.ts           # Typed API client (/api/*)
│   │   └── components/               # UI components
│   ├── vite.config.ts                # Dev proxy for /api → :8000
│   └── package.json
├── requirements.txt                  # Root copy (same as backend/requirements.txt)
└── README.md
```
