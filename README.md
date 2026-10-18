# Cold Call Copilot (Meridian Growth Partners)

A lightweight, low-friction live cold-call interface designed to assist SDRs in real time without imposing cognitive overload. It guides callers through structured stage progression, logs interaction telemetry to Supabase, and uses Gemini to generate grounded post-call CRM summaries.

---

## Deployment & System Deliverables

* **Live Frontend (Vercel):** https://cold-call-copilot-ruddy.vercel.app
* **Production Backend (Render):** https://cold-call-copilot-pogb.onrender.com
* **Backend Health Check:** https://cold-call-copilot-pogb.onrender.com/health
* **LLM Engine:** Google Gemini (`gemini-3.8-flash`) via the `google-genai` SDK
  * **Role & Purpose:** Post-call CRM intelligence. It takes recorded stage telemetry, prospect responses, and scratch notes to generate a strictly grounded, 2-sentence executive summary along with actionable CRM recommendations upon call completion, preventing ungrounded sales-optimism hallucinations.

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
* **LLM Engine:** Google Gemini (`gemini-3.8-flash`) via `google-genai` SDK

---

## Database Schema (Supabase SQL)

The PostgreSQL database runs on Supabase with the following schema:

-- Table: calls
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    prospect_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    prospect_role TEXT,
    current_stage INT DEFAULT 1,
    highest_stage INT DEFAULT 1,
    outcome TEXT DEFAULT 'in_progress',
    duration_seconds INT DEFAULT 0,
    prospect_notes TEXT,
    llm_summary TEXT
);

-- Table: call_stages
CREATE TABLE IF NOT EXISTS public.call_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
    stage_number INT NOT NULL,
    stage_name TEXT NOT NULL,
    action_tag TEXT,
    prospect_words TEXT
);

---

## Project Structure

cold-call-copilot/
├── backend/
│   ├── main.py              # FastAPI endpoints, DB client, Gemini prompt logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/                 # React components, stage definitions, past calls view
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Vite configuration
├── schema.sql               # Supabase PostgreSQL schema definition
├── .gitignore
└── README.md

---

## Local Development Setup

### 1. Prerequisites
* Python 3.10+
* Node.js 18+
* Supabase project with `calls` and `call_stages` tables
* Google AI Studio Gemini API key

### 2. Backend Setup
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

Create a `.env` file inside `backend/`:
SUPABASE_URL="https://<your-project>.supabase.co"
SUPABASE_KEY="<your-supabase-key>"
GEMINI_API_KEY="<your-gemini-api-key>"

Run the backend server:
uvicorn main:app --reload
The backend runs at http://localhost:8000.

### 3. Frontend Setup
cd frontend
npm install
npm run dev
The frontend runs at http://localhost:5173.

---

## Deployment Configuration

* **Backend (Render Web Service):**
  * Root Directory: backend
  * Build Command: pip install -r requirements.txt
  * Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
  * Environment Variables: SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY

* **Frontend (Vercel):**
  * Root Directory: frontend
  * Framework Preset: Vite
  * Environment Variables: VITE_API_URL pointing to your deployed Render service URL (https://cold-call-copilot-pogb.onrender.com)