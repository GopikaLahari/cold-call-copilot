import os
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI(title="Meridian Cold Call Surface API")

# Enable CORS so the React frontend can communicate freely with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Health check endpoint (Mandatory for Render)
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Request Schemas
class StartCallRequest(BaseModel):
    prospect_name: str
    company_name: str
    prospect_role: Optional[str] = "Executive"

class StageLogRequest(BaseModel):
    stage_number: int
    stage_name: str
    action_tag: Optional[str] = None
    prospect_words: Optional[str] = None

class CompleteCallRequest(BaseModel):
    outcome: str
    duration_seconds: int
    final_notes: Optional[str] = None

# 2. Start a new call record
@app.post("/calls/start")
def start_call(payload: StartCallRequest):
    data = {
        "prospect_name": payload.prospect_name,
        "company_name": payload.company_name,
        "prospect_role": payload.prospect_role,
        "current_stage": 1,
        "highest_stage": 1,
        "outcome": "in_progress"
    }
    res = supabase.table("calls").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to initialize call session")
    return res.data[0]

# 3. Log stage event
@app.post("/calls/{call_id}/stage")
def log_stage(call_id: str, payload: StageLogRequest):
    stage_record = {
        "call_id": call_id,
        "stage_number": payload.stage_number,
        "stage_name": payload.stage_name,
        "action_tag": payload.action_tag,
        "prospect_words": payload.prospect_words
    }
    supabase.table("call_stages").insert(stage_record).execute()

    # Track highest stage reached
    call = supabase.table("calls").select("highest_stage").eq("id", call_id).single().execute()
    curr_highest = call.data.get("highest_stage", 1) if call.data else 1
    new_highest = max(curr_highest, payload.stage_number)

    supabase.table("calls").update({
        "current_stage": payload.stage_number,
        "highest_stage": new_highest
    }).eq("id", call_id).execute()

    return {"status": "stage_logged", "highest_stage": new_highest}

# 4. End call & generate Gemini executive summary
@app.post("/calls/{call_id}/complete")
def complete_call(call_id: str, payload: CompleteCallRequest):
    stages_res = supabase.table("call_stages").select("*").eq("call_id", call_id).order("created_at").execute()
    logged_events = stages_res.data or []

    events_summary = "\n".join([
        f"- Stage {s['stage_number']} ({s['stage_name']}): Action='{s.get('action_tag')}', Notes='{s.get('prospect_words')}'"
        for s in logged_events
    ])

    summary_text = "Call completed."
    if ai_client:
        prompt = (
            f"You are an executive CRM assistant logging a cold call for Meridian Growth Partners.\n"
            f"A cold call concluded with the following recorded data:\n"
            f"- Final Outcome: {payload.outcome}\n"
            f"- Call Duration: {payload.duration_seconds} seconds\n"
            f"- Logged Events by Stage:\n{events_summary}\n"
            f"- Caller Scratch Notes: {payload.final_notes or 'None'}\n\n"
            f"Instructions:\n"
            f"1. Generate a concise 2-sentence summary based ONLY on the recorded data above.\n"
            f"2. Sentence 1: State what occurred and the prospect's stance, using only the recorded events and notes. Do not infer unrecorded conversation details.\n"
            f"3. Sentence 2: If a follow-up is explicitly supported by the recorded events or notes, state it. If not, state: 'No follow-up was recorded.' Then provide a recommended CRM action based on the outcome.\n"
            f"4. Apply these outcome-specific rules:\n"
            f"   - If the outcome is 'do_not_call', recommend placing the contact on the internal suppression list because the prospect explicitly requested no further contact.\n"
            f"   - If the outcome is 'not_interested', recommend updating the CRM status to Not Interested and avoiding active outreach.\n"
            f"   - If the outcome is 'wrong_person', recommend reviewing and correcting the contact record.\n"
            f"   - For other outcomes, recommend an action only when supported by the recorded information.\n"
            f"   - Phrase CRM actions as recommendations, not as actions already performed by the system.\n"
            f"5. NEVER invent callback dates, meetings, prospect needs, explanations, commitments, or conversation details.\n"
            f"6. Do not treat a simple decline as an explicit request not to be contacted.\n"
            f"7. Return plain text only. Do not use markdown asterisks, bullet points, or headings such as 'Summary:'."
        )
        try:
            response = ai_client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt
            )
            summary_text = response.text.strip()
        except Exception as e:
            print("Gemini generation error:", repr(e))
            summary_text = (
                f"Summary fallback: Call logged with outcome '{payload.outcome}'."
            )
    update_data = {
        "outcome": payload.outcome,
        "duration_seconds": payload.duration_seconds,
        "prospect_notes": payload.final_notes,
        "llm_summary": summary_text,
        "ended_at": datetime.utcnow().isoformat()
    }
    res = supabase.table("calls").update(update_data).eq("id", call_id).execute()
    return res.data[0] if res.data else update_data

# 5. List all calls for the history screen
@app.get("/calls")
def get_calls():
    res = supabase.table("calls").select("*").order("created_at", desc=True).limit(50).execute()
    return res.data or []