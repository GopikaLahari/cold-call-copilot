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
