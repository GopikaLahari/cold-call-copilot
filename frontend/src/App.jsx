import React, { useState, useEffect } from "react";
import { CALL_STAGES, OUTCOME_OPTIONS } from "./stages";

const API_BASE = import.meta.env.VITE_API_URL || "https://cold-call-copilot-pogb.onrender.com";

export default function App() {
  const [view, setView] = useState("call");
  const [activeCall, setActiveCall] = useState(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");
  const [notes, setNotes] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState("next_step_agreed");
  const [pastCalls, setPastCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prospectName, setProspectName] = useState("Dev Sharma");
  const [prospectRole, setProspectRole] = useState("Technical Services Director");
  const [companyName, setCompanyName] = useState("Kalpana Chem Supplies");

  useEffect(() => {
    let timer;
    if (activeCall && !isEnding) {
      timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall, isEnding]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStartCall = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_name: prospectName,
          company_name: companyName,
          prospect_role: prospectRole,
        }),
      });
      const data = await res.json();
      setActiveCall(data);
      setCurrentStageIdx(0);
      setElapsed(0);
      setSelectedTag("");
      setNotes("");
      setIsEnding(false);
    } catch (err) {
      alert("Could not reach backend. Is FastAPI running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStage = async () => {
    const stage = CALL_STAGES[currentStageIdx];
    try {
      if (activeCall?.id) {
        await fetch(`${API_BASE}/calls/${activeCall.id}/stage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage_number: stage.id,
            stage_name: stage.name,
            action_tag: selectedTag || null,
            prospect_words: notes || null,
          }),
        });
      }
      setSelectedTag("");
      setNotes("");
      if (currentStageIdx < CALL_STAGES.length - 1) {
        setCurrentStageIdx((prev) => prev + 1);
      } else {
        setIsEnding(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteCall = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calls/${activeCall.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: selectedOutcome,
          duration_seconds: elapsed,
          final_notes: notes || null,
        }),
      });
      await res.json();
      setActiveCall(null);
      setIsEnding(false);
      fetchPastCalls();
      setView("history");
    } catch (e) {
      alert("Error saving call outcome");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastCalls = async () => {
    try {
      const res = await fetch(`${API_BASE}/calls`);
      const data = await res.json();
      setPastCalls(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (view === "history") {
      fetchPastCalls();
    }
  }, [view]);

  const currentStage = CALL_STAGES[currentStageIdx];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>
          MERIDIAN <span style={{ color: "#2563eb" }}>• CALL SURFACE</span>
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setView("call")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: view === "call" ? "#2563eb" : "#fff",
              color: view === "call" ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Live Call
          </button>
          <button
            onClick={() => setView("history")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: view === "history" ? "#2563eb" : "#fff",
              color: view === "history" ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Past Calls
          </button>
        </div>
      </div>

      {view === "call" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "2px solid #111",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {!activeCall ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Start New Cold Call</h3>
                <p style={{ fontSize: "13px", color: "#666" }}>Select or customize prospect from transcripts</p>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}>Prospect Name</label>
                <input
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}>Designation / Role</label>
                <input
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={prospectRole}
                  onChange={(e) => setProspectRole(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}>Company Name</label>
                <input
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ccc" }}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <button
                onClick={handleStartCall}
                disabled={loading}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "none",
                  marginTop: "8px",
                }}
              >
                {loading ? "Starting..." : "📞 DIAL PROSPECT"}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#111" }}>{activeCall.prospect_name}</h3>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    {activeCall.prospect_role} • {activeCall.company_name}
                  </p>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: "700", background: "#fee2e2", color: "#b91c1c", padding: "4px 8px", borderRadius: "4px" }}>
                  {formatTime(elapsed)}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "4px" }}>
                {CALL_STAGES.map((stg, i) => (
                  <div
                    key={stg.id}
                    style={{
                      textAlign: "center",
                      padding: "6px 0",
                      fontSize: "12px",
                      fontWeight: "700",
                      borderRadius: "4px",
                      background: i === currentStageIdx ? "#2563eb" : i < currentStageIdx ? "#dbeafe" : "#f1f3f5",
                      color: i === currentStageIdx ? "#fff" : i < currentStageIdx ? "#1e40af" : "#888",
                      border: i === currentStageIdx ? "1px solid #1d4ed8" : "1px solid transparent",
                    }}
                  >
                    {stg.id}
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#666", textTransform: "uppercase" }}>
                  Stage {currentStage.id} of 8
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#000", marginTop: "2px" }}>
                  {currentStage.name}
                </h2>
                <p style={{ fontSize: "13px", color: "#444", marginTop: "4px", lineHeight: "1.4" }}>
                  {currentStage.purpose}
                </p>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#666", textTransform: "uppercase" }}>
                  They May Say
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                  {currentStage.theyMaySay.map((phrase, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 12px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#344155",
                        fontStyle: "italic",
                      }}
                    >
                      {phrase}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#666", textTransform: "uppercase" }}>
                  What Happened
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
                  {currentStage.quickTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "6px",
                        border: selectedTag === tag ? "2px solid #2563eb" : "1px solid #cbd5e1",
                        background: selectedTag === tag ? "#2563eb" : "#ffffff",
                        color: selectedTag === tag ? "#ffffff" : "#1e293b",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#666", textTransform: "uppercase" }}>
                  Their Words
                </span>
                <textarea
                  rows={2}
                  placeholder="Type prospect's exact words or key objections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    marginTop: "6px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    resize: "none",
                  }}
                />
              </div>

              {isEnding ? (
                <div style={{ background: "#fef2f2", border: "1px solid #f87171", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#991b1b" }}>Select Final Call Outcome:</label>
                  <select
                    value={selectedOutcome}
                    onChange={(e) => setSelectedOutcome(e.target.value)}
                    style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                  >
                    {OUTCOME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={handleCompleteCall}
                      disabled={loading}
                      style={{ flex: 1, padding: "10px", background: "#b91c1c", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}
                    >
                      {loading ? "Generating Gemini Summary..." : "Confirm & Save Call"}
                    </button>
                    <button
                      onClick={() => setIsEnding(false)}
                      style={{ padding: "10px", background: "#e5e7eb", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    onClick={handleNextStage}
                    style={{
                      flex: 2,
                      padding: "12px",
                      background: "#0f172a",
                      color: "#ffffff",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    {currentStageIdx < CALL_STAGES.length - 1
                      ? `NEXT: ${CALL_STAGES[currentStageIdx + 1].name.toUpperCase()}`
                      : "FINISH CALL"}
                  </button>
                  <button
                    onClick={() => setIsEnding(true)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#ffffff",
                      color: "#b91c1c",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    END CALL
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Past Calls Log</h3>
          {pastCalls.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#888" }}>No saved calls yet. Complete a call to see it here.</p>
          ) : (
            pastCalls.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "14px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>
                      {c.prospect_name}, {c.company_name}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#666" }}>{c.prospect_role}</p>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      textTransform: "uppercase",
                    }}
                  >
                    Stage {c.highest_stage} • {c.outcome}
                  </span>
                </div>

                {c.llm_summary && (
                  <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "6px", borderLeft: "3px solid #2563eb", marginTop: "4px" }}>
                    <p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.4" }}>
                      <strong>Gemini Summary:</strong> {c.llm_summary}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  <span>Duration: {formatTime(c.duration_seconds || 0)}</span>
                  <span>{new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}