export const CALL_STAGES = [
    {
        id: 1,
        name: "Opening",
        purpose: "Verify identity and introduce yourself in under 5 seconds.",
        theyMaySay: [
            "\"Who is this? Where are you calling from?\"",
            "\"I am driving / in a meeting right now.\"",
            "\"Wrong number / person left the company.\""
        ],
        quickTags: ["Right person reached", "In a meeting / Busy", "Wrong number", "Gatekeeper / Assistant"]
    },
    {
        id: 2,
        name: "Purpose",
        purpose: "Say why you called in 1–2 sentences they can repeat to colleagues.",
        theyMaySay: [
            "\"Regarding what? What is this about?\"",
            "\"Where did you get my contact number?\"",
            "\"Is this a sales call?\""
        ],
        quickTags: [
            "Asked what we do",
            "Follow-up on prior email",
            "Asked where we got number",
            "Listened patiently"
        ]
    },
    {
        id: 3,
        name: "Permission",
        purpose: "Secure explicit buy-in to take 2 minutes right now.",
        theyMaySay: [
            "\"Can you call back in 30 minutes / an hour?\"",
            "\"Haan, boliye / Go ahead.\"",
            "\"Send details on WhatsApp first.\""
        ],
        quickTags: ["Agreed to speak now", "Call back in 30–60 mins", "Send WhatsApp first", "Silent / Hesitant"]
    },
    {
        id: 4,
        name: "Their Business",
        purpose: "Confirm company context before discussing growth areas.",
        theyMaySay: [
            "\"We are still a startup / too small for this.\"",
            "\"This is a back-office / branch unit, not HQ.\"",
            "\"What exactly do you think we do?\""
        ],
        quickTags: ["Active mid-market firm", "Early-stage startup", "Branch / Back-office only", "Defensive about size"]
    },
    {
        id: 5,
        name: "Their Need, In Their Words",
        purpose: "Listen and capture their actual bottleneck or priorities.",
        theyMaySay: [
            "\"We have an internal business model we are following.\"",
            "\"We are trying to expand products into new markets.\"",
            "\"Everything is fine, we have no operational issues.\""
        ],
        quickTags: ["Internal model / Self-sufficient", "Scaling / Product expansion", "Operational bottlenecks", "Claims no need"]
    },
    {
        id: 6,
        name: "Objection",
        purpose: "Acknowledge the hesitation without arguing.",
        theyMaySay: [
            "\"I'm not the relevant person for this.\"",
            "\"We already have internal teams / agencies handling this.\"",
            "\"I'm not really interested in doing this.\""
        ],
        quickTags: ["Not relevant person / Referred", "Already have solution", "Hard not interested", "Timing is bad"]
    },
    {
        id: 7,
        name: "Next Step",
        purpose: "Lock in one specific follow-up commitment.",
        theyMaySay: [
            "\"Tuesday after 2 PM for a Google Meet.\"",
            "\"Note down Suresh ji's number and speak to him.\"",
            "\"Bump the email up, I will reply there.\""
        ],
        quickTags: ["GMeet / Call scheduled", "Referred to colleague + number", "Agreed to review email report", "Soft brush-off"]
    },
    {
        id: 8,
        name: "Close",
        purpose: "Confirm details, thank them warmly, and log the outcome.",
        theyMaySay: [
            "\"Right, got it. Thank you.\"",
            "\"Send calendar invite to my email.\"",
            "*Abrupt hang up / Disconnected*"
        ],
        quickTags: ["Meeting confirmed", "Lead referred", "Follow-up email sent", "Cold drop / Call hung up"]
    }
];

export const OUTCOME_OPTIONS = [
    "next_step_agreed",
    "agreed_to_receive_report",
    "interested",
    "follow_up",
    "call_again",
    "not_interested",
    "wrong_person",
    "moved_company",
    "do_not_call",
    "not_logged"
];