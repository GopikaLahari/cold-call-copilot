# Cold Call Copilot (Meridian Growth Partners)

A lightweight, low-friction live cold-call interface designed to assist SDRs in real time without imposing cognitive overload. It guides callers through structured stage progression, logs interaction telemetry to Supabase, and uses Gemini to generate grounded post-call CRM summaries.

---

## Core Design Principles

### 1. Cognitive Bandwidth First (Option C Architecture)
* Live cold calling requires split-second listening and conversational agility. Forcing an SDR to type extensive transcripts or read mid-call LLM suggestions creates cognitive friction.
* The interface relies on single-click quick-tag chips and low-friction stage progression during the call.
* Deep LLM synthesis is deferred to post-call execution, where Gemini compiles logged stage milestones and scratch notes into executive CRM notes.

### 2. Grounded Summarization & Guardrails
* Summaries strictly reflect observed facts, logged stages, and explicit prospect statements.
* Guardrails eliminate standard sales-optimism hallucinations (such as inventing 3–6 month follow-ups when a prospect clearly declines).
* Accurately distinguishes between a prospect explicitly requesting no contact (`do_not_call`) versus simply declining an offering (`not_interested`).
* Proposed next steps are framed as CRM recommendations rather than executed actions.

---

## Tech Stack

* **Frontend:** React (Vite), CSS3, Fetch API
* **Backend:** FastAPI (Python 3.10+), Pydantic, Uvicorn
* **Database:** Supabase (PostgreSQL) tracking call logs and stage transitions
* **LLM Engine:** Google Gemini Flash via `google-genai` SDK

---

## Project Structure

```text
cold-call-copilot/
├── backend/
│   ├── main.py              # FastAPI endpoints, DB client, Gemini prompt logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/                 # React components, stage definitions, past calls view
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Vite configuration
├── .gitignore
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
* Python 3.10+
* Node.js 18+
* Supabase project with `calls` and `call_stages` tables
* Google AI Studio Gemini API key

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```env
SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_KEY="<your-supabase-key>"
GEMINI_API_KEY="<your-gemini-api-key>"
```

Run the backend server:
```bash
uvicorn main:app --reload
```
The backend runs at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend runs at `http://localhost:5173`.

---

## Deployment Configuration

* **Backend (Render Web Service):**
  * Root Directory: `backend`
  * Build Command: `pip install -r requirements.txt`
  * Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  * Environment Variables: `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`

* **Frontend (Vercel):**
  * Root Directory: `frontend`
  * Framework Preset: `Vite`
  * Environment Variables: `VITE_API_URL` pointing to your deployed Render service URL