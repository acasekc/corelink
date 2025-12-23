# Discovery Bot - Comprehensive Plan

## 1. Executive Overview

The Discovery Bot is an intelligent, interactive system that helps non-technical users articulate project requirements through guided conversation. The system:
- Engages users in multi-turn Q&A dialogue
- Intelligently gathers requirements progressively
- Generates three distinct outputs:
  - **User-Facing Summary**: High-level overview without technical/cost details
  - **Administrator Full Plan**: Complete technical specs, cost/timing estimates, and recommendations
  - **Database Record**: Structured data for admin retrieval and analysis

---

## 2. System Architecture

### 2.1 High-Level Flow

```
User Onboarding → Invite Code Validation → Session Creation
    ↓
Multi-turn Q&A Conversation (LLM-driven)
    ↓
Conversation State Management & Context Retention
    ↓
Plan Generation (Structured JSON)
    ↓
Dual Output Generation
    ├── User: High-level overview (email)
    └── Admin: Full plan with costs/timing (database + email)
    ↓
Plan Retrieval & Management (Admin Dashboard)
```

### 2.2 Tech Stack

**Backend:**
- Laravel 11 (existing framework)
- PHP 8.2+
- **MySQL 8.0+ or PostgreSQL 12+** (both support JSON columns)
- Queue System: Laravel Jobs (for async LLM calls)
- OpenAI API (or compatible LLM provider)

**Frontend:**
- React with Inertia.js (aligns with existing setup)
- TypeScript (recommended)
- TailwindCSS (assuming existing setup)

**External Services:**
- OpenAI API (GPT-4 for reasoning, planning)
- Email Service (existing Mailjet setup)

**Optional - Voice Chat Add-on:**
- Web Audio API (client-side recording)
- OpenAI Whisper API (speech-to-text)
- OpenAI TTS API (text-to-speech for assistant responses)
- AWS S3 or similar (optional audio file storage)

### 2.3 Voice Chat Integration (Optional Feature)

**Yes, voice chat fits perfectly into the framework!** It can be implemented as an optional toggle alongside text mode:

**How It Works:**
1. User records audio message via browser (Web Audio API)
2. Audio sent to backend → Whisper API transcription
3. Transcribed text processed same as text messages (Stage 1 LLM)
4. Assistant response generated (same flow)
5. TTS API converts response to audio
6. User hears bot response (optional auto-play)
7. Both audio and transcribed text stored in conversation

**Advantages:**
- More natural conversational flow
- Reduces typing friction for non-technical users
- Better captures tone/intent than text
- Improves accessibility
- Can be toggled on/off per session
- No major architectural changes needed

**Implementation Changes:**
- Frontend: Add audio recorder UI component
- Backend: Add `audio_url` and `transcribed_text` fields to `bot_conversations` table
- New API: `/api/sessions/{id}/message-voice` (accepts audio blob)
- New Service: `SpeechService` handling Whisper + TTS calls
- Queue job: `TranscribeAudioJob` + `GenerateSpeechJob`

**Cost Considerations:**
- Whisper: ~$0.02 per 1 minute of audio
- TTS: ~$0.015 per 1K characters
- Estimate: +$0.05-0.10 per conversation

**See Section 16 (below) for detailed voice chat implementation plan.**

---

## 3. Database Schema

### 3.1 Core Tables

**Database Compatibility:**
MySQL 8.0+ and PostgreSQL 12+ both fully support JSON columns used throughout this schema. If using MySQL, ensure `json_valid()` is used in migrations where needed. Both databases handle the JSON structure identically for this use case.

#### `bot_sessions`
```
- id (UUID)
- user_id (nullable - before auth for logged-in users)
- invite_code_id (foreign key)
- started_at (timestamp)
- completed_at (nullable timestamp)
- status (enum: active, paused, completed, abandoned)
- conversation_state (JSON) - stores all turns
- metadata (JSON) - user info, context
```

#### `invite_codes`
```
- id (UUID)
- admin_user_id (foreign key to users)
- code (string, unique, random 8-12 chars)
- email (string, optional - can be pre-assigned)
- created_at (timestamp)
- expires_at (nullable timestamp)
- used_by_user_id (nullable, foreign key)
- used_at (nullable timestamp)
- is_active (boolean)
- max_uses (int, default 1)
- current_uses (int)
- metadata (JSON)
```

#### `discovery_plans`
```
- id (UUID)
- session_id (foreign key to bot_sessions)
- admin_user_id (foreign key)
- raw_conversation (JSON) - full Q&A transcript
- structured_requirements (JSON) - parsed/extracted requirements
- high_level_plan (JSON) - user-facing summary
- technical_plan (JSON) - full technical specs
- cost_estimate (JSON) - { total, breakdown, currency }
- timeline_estimate (JSON) - { phases, duration, milestones }
- tech_recommendations (JSON) - stack, libraries, architecture
- generated_at (timestamp)
- updated_at (timestamp)
```

#### `plan_outputs`
```
- id (UUID)
- plan_id (foreign key)
- output_type (enum: user_summary, admin_full, email_sent)
- content (JSON or text)
- recipient_email (string)
- sent_at (nullable timestamp)
- created_at (timestamp)
```

#### `bot_conversations` (turn history)
```
- id (UUID)
- session_id (foreign key)
- turn_number (int)
- user_message (text)
- user_audio_url (nullable string) - voice message storage path/URL
- user_audio_transcribed (boolean) - whether transcription is available
- assistant_message (text)
- assistant_audio_url (nullable string) - TTS audio storage path/URL
- interaction_mode (enum: text, voice, both) - how user interacted
- tokens_used (JSON) - { prompt, completion, total }
- turn_context (JSON) - relevantData at this turn
- created_at (timestamp)
```

### 3.2 Relationships

```
User (admin) --< InviteCode --< BotSession >-- DiscoveryPlan
                                 |
                                 +--< BotConversation
                                 
DiscoveryPlan --< PlanOutput
```

---

## 4. LLM Integration Strategy

### 4.1 Multi-Stage Approach

**Stage 1: Conversational Interviewer**
- Role: Ask clarifying questions to understand project vision
- Model: GPT-4 (for better reasoning)
- Context: Maintain full conversation history
- Guidelines: No assumptions, dig deeper on vague answers
- Token budget: ~2K-4K per turn

**Stage 2: Requirement Extractor**
- Role: Parse conversation into structured requirements
- Model: GPT-4 or GPT-4 Turbo
- Input: Full conversation transcript
- Output: Structured JSON with features, constraints, integrations, scale, budget
- Token budget: ~4K-8K

**Stage 3: Plan Generator**
- Role: Create technical architecture, timeline, cost estimates
- Model: GPT-4 (planning requires reasoning)
- Input: Extracted requirements
- Output: Tech stack, architecture, phased timeline, cost breakdown
- Token budget: ~6K-10K

**Stage 4: Summary Generator**
- Role: Create user-friendly overview (non-technical)
- Model: GPT-3.5 Turbo (simpler task, cost-effective)
- Input: High-level plan
- Output: Readable summary, key milestones, no costs/timing
- Token budget: ~2K-3K

### 4.2 Conversation Management

**Context Retention:**
- Store all turns in database
- Summarize earlier turns if conversation grows (>20 turns)
- Use sliding window: last 10 turns + summary of earlier turns
- Include extracted requirements as context

**Preventing Hallucinations:**
- Use structured prompts with explicit constraints
- Request JSON output with schema validation
- Chain-of-thought prompting for reasoning steps
- Fact-check against conversation before including in plan
- Explicit rule: "Only use information from the user's answers"

**Conversation Flow Strategy:**
```
Turn 1-2: Vision & Goals
  - What problem are you solving?
  - Who are your users?

Turn 3-5: Core Features & Scope
  - Top 5 features needed?
  - MVP vs full vision?

Turn 6-8: Technical Context
  - Existing systems to integrate?
  - Performance/scale requirements?

Turn 9-11: Timeline & Budget
  - When do you need launch?
  - Budget constraints?

Turn 12: Final confirmation & generation
  - Ready to generate plan?
```

---

## 5. API Endpoints

### 5.1 Authentication & Setup

```
POST /api/auth/invite-validate
  - Input: invite_code
  - Output: { valid: bool, expires_at?, message }
  - Response: 200 or 400

POST /api/sessions/create
  - Input: invite_code, user_email (optional)
  - Output: { session_id, session_token }
  - Creates BotSession + first greeting message
  - Response: 201 or 400

GET /api/sessions/{id}
  - Auth: Session token (in header or query)
  - Output: { session_id, status, started_at, turn_count }
  - Response: 200 or 401
```

### 5.2 Conversation Endpoints

```
POST /api/sessions/{id}/message
  - Auth: Session token
  - Input: { message: string }
  - Process: Save user message, call LLM, save assistant response
  - Output: { turn_number, user_message, assistant_message, session_status }
  - Queued: LLM calls via Laravel Job
  - Response: 200 or 401/404

POST /api/sessions/{id}/message-voice
  - Auth: Session token
  - Input: { audio: Blob, format: 'webm' | 'mp3', include_tts: boolean }
  - Process: 
    - Save audio file to storage
    - Queue TranscribeAudioJob (Whisper API)
    - On transcription complete: process text via Stage 1 LLM
    - If include_tts: Queue GenerateSpeechJob (TTS API)
    - Save BotConversation with audio URLs
  - Output: { turn_number, is_processing: true, transcription_id }
  - Polling endpoint available for transcription status
  - Response: 202 (Accepted - async) or 201 (if immediate response)

GET /api/sessions/{id}/message/{turn_id}/transcription-status
  - Auth: Session token
  - Output: { status: 'processing' | 'complete' | 'failed', transcribed_text?, audio_url? }
  - Response: 200 or 404

GET /api/sessions/{id}/history
  - Auth: Session token
  - Output: { turns: [{ user_message, assistant_message, turn_number, interaction_mode, audio_urls? }] }
  - Response: 200 or 401/404
```

### 5.3 Plan Generation & Retrieval

```
POST /api/sessions/{id}/generate-plan
  - Auth: Session token
  - Input: (optional) { finalization_message: string }
  - Process: 
    - Call Stage 2 (Requirement Extractor)
    - Call Stage 3 (Plan Generator)
    - Call Stage 4 (Summary Generator)
    - Save to DiscoveryPlan
    - Create PlanOutput records
    - Queue email jobs
  - Output: { plan_id, status, generation_complete: bool }
  - Response: 202 (Accepted - async)

GET /api/plans/{id}
  - Auth: Admin token OR Session token (user can only see summary)
  - Output: 
    - If admin: full technical plan
    - If user: high-level summary only
  - Response: 200 or 401/403

GET /api/admin/plans
  - Auth: Admin token
  - Query: { page, per_page, filter, sort }
  - Output: Paginated list of all plans with metadata
  - Response: 200 or 401

GET /api/admin/plans/{id}/full
  - Auth: Admin token
  - Output: Complete technical plan with all details
  - Response: 200 or 401/403
```

### 5.4 Invite Management (Admin Only)

```
POST /api/admin/invite-codes
  - Auth: Admin token
  - Input: { email: string, expires_in_days: int, max_uses: int }
  - Output: { code, created_at, expires_at }
  - Response: 201 or 401

GET /api/admin/invite-codes
  - Auth: Admin token
  - Query: { status, page }
  - Output: Paginated list of invite codes with usage stats
  - Response: 200 or 401

DELETE /api/admin/invite-codes/{id}
  - Auth: Admin token
  - Output: { deleted: bool }
  - Response: 204 or 401/403
```

---

## 6. Frontend Components & Pages

### 6.1 User-Facing Pages

**`/bot/welcome`**
- Invite code input form
- Submit → creates session
- Navigate to conversation page

**`/bot/conversation`**
- Main chat interface
- Message input at bottom
- Scrollable conversation history
- "Generate Plan" button (appears after X turns or on completion)
- Loading states for LLM processing

**`/bot/plan-summary`**
- Display user-facing plan summary
- Show key milestones, high-level features
- "Download Summary" button
- No technical details, costs, or timeline shown

### 6.2 Admin-Facing Pages

**`/admin/plans`**
- Table view of all plans
- Columns: User Email, Created Date, Status, Actions
- Filters: Date range, status
- Search: By email or session ID
- Actions: View Full Plan, Download, Delete

**`/admin/plans/{id}`**
- Full technical plan view
- Sections:
  - Extracted Requirements
  - Technical Architecture
  - Tech Stack Recommendations
  - Phased Timeline with Milestones
  - Cost Breakdown
  - Implementation Risks
- Export options: PDF, JSON

**`/admin/invite-codes`**
- Create new codes
- List active codes with usage stats
- Revoke codes
- Export list

---

## 7. Data Flow Diagrams

### 7.1 Conversation Flow

```
User → Message Input
  ↓
API /sessions/{id}/message
  ↓
Save BotConversation (user message)
  ↓
Queue LLM Call (Stage 1: Interviewer)
  ↓
LLM Response ← Context (full history + requirements)
  ↓
Save BotConversation (assistant message)
  ↓
Return to User (Real-time via polling/WebSocket)
  ↓
User Reads & Responds (loop)
```

### 7.2 Plan Generation Flow

```
User Triggers Plan Generation
  ↓
Job Queue: Requirement Extraction (Stage 2)
  ├─ Input: Full conversation
  └─ Output: Structured requirements (JSON)
  ↓
Job Queue: Plan Generation (Stage 3)
  ├─ Input: Extracted requirements
  └─ Output: Tech specs, timeline, costs
  ↓
Job Queue: Summary Generation (Stage 4)
  ├─ Input: Plan (non-technical filter)
  └─ Output: User-friendly summary
  ↓
Save DiscoveryPlan + PlanOutput records
  ↓
Queue Email Jobs:
  ├─ To User: Summary only
  └─ To Admin: Full plan
  ↓
Update Session Status → "completed"
```

---

## 8. Security & Authorization

### 8.1 Authentication

**Invite Code Validation:**
- Codes are random, 12-character alphanumeric
- One-time use (or configurable)
- Expiration dates
- Can be email-bound (optional)

**Session Token:**
- JWT or Laravel session cookie
- Scoped to single session
- Short TTL (2-4 hours)
- Cannot be used for admin endpoints

**Admin Token:**
- Standard Laravel auth (existing system)
- New admin role: "discovery_bot_admin"
- Used for invite management + plan retrieval

### 8.2 Authorization Rules

```
User Can:
  ✓ Access only their own session
  ✓ View their own plan summary
  ✓ Download/receive their own summary

Admin Can:
  ✓ Create/revoke invite codes
  ✓ View all plans (full technical details)
  ✓ View all sessions
  ✓ Export plans as PDF/JSON
  ✓ Manage user access

System:
  ✓ Auto-delete sessions after 30 days of inactivity
  ✓ Auto-expire codes after set date
```

---

## 9. LLM Prompts & Templates

### 9.1 Stage 1 - Conversational Interviewer

**System Prompt:**
```
You are an expert project discovery interviewer. Your role is to ask insightful,
clarifying questions to deeply understand a user's project vision, requirements, 
and constraints.

Guidelines:
- Ask ONE question at a time
- Build on previous answers
- Challenge vague answers with follow-ups
- Maintain a friendly, professional tone
- Never make assumptions
- Focus on WHO, WHAT, WHY, and HOW
- Avoid technical jargon unless user introduces it

Current conversation stage: [Early/Mid/Late based on turn number]
Previous key findings: [JSON snippet of extracted requirements so far]

Ask your next question to advance understanding.
```

### 9.2 Stage 2 - Requirement Extractor

**System Prompt + Template:**
```
Extract structured requirements from this conversation.

Output ONLY valid JSON matching this schema:
{
  "project": {
    "name": "string",
    "vision": "string",
    "problem_statement": "string"
  },
  "users": {
    "primary_users": "string",
    "user_count_estimate": "string",
    "user_locations": "string"
  },
  "features": {
    "core_features": ["string"],
    "nice_to_have": ["string"],
    "integrations": ["string"]
  },
  "technical": {
    "existing_systems": ["string"],
    "scale_expectations": "string",
    "performance_critical": ["string"],
    "security_requirements": ["string"]
  },
  "timeline": {
    "desired_launch": "string",
    "phases": "string"
  },
  "constraints": {
    "budget": "string",
    "team_size": "string",
    "other": ["string"]
  },
  "confidence": "low|medium|high",
  "gaps": ["string - areas needing clarification"]
}

Conversation:
[Full transcript]

Extract requirements. Be precise. Only include information explicitly stated.
```

### 9.3 Stage 3 - Plan Generator

**System Prompt:**
```
Create a detailed technical implementation plan based on these requirements.

Input requirements: [JSON from Stage 2]

Output ONLY valid JSON with this structure:
{
  "executive_summary": "string",
  "tech_stack": {
    "backend": { "framework": "Laravel", "language": "PHP", ... },
    "frontend": { "framework": "React", "state_management": "..." },
    "database": { "primary": "PostgreSQL", "cache": "Redis", ... },
    "deployment": { "hosting": "...", "infrastructure": "..." }
  },
  "architecture": {
    "high_level": "description",
    "diagrams": "ASCII or description",
    "components": [...]
  },
  "implementation_phases": [
    {
      "phase": 1,
      "name": "Foundation & Setup",
      "duration": "2 weeks",
      "deliverables": ["string"],
      "blockers": []
    }
  ],
  "cost_estimate": {
    "development": { "hours": 0, "rate_per_hour": 0, "subtotal": 0 },
    "infrastructure": { "monthly": 0, "annual": 0 },
    "third_party": { "services": [...], "subtotal": 0 },
    "total_first_year": 0,
    "assumptions": ["string"]
  },
  "timeline": {
    "total_weeks": 0,
    "critical_path": ["string"],
    "risks": [
      { "risk": "string", "mitigation": "string", "impact": "high|medium|low" }
    ]
  },
  "recommendations": {
    "architectural_decisions": ["string"],
    "technology_rationale": "string",
    "team_composition": "string"
  }
}

Be realistic about timelines and costs. Include assumptions.
```

### 9.4 Stage 4 - Summary Generator

**System Prompt:**
```
Create a user-friendly, non-technical summary of this plan.

Input plan: [Full technical plan JSON]

Rules:
- NO technical jargon or acronyms
- NO cost estimates or timeline details
- NO implementation phases or risk analysis
- NO developer hiring/team composition
- INCLUDE: High-level vision, core features, key milestones
- Use plain language an executive would understand
- Keep to 500-800 words

Output as JSON:
{
  "vision": "string",
  "core_features": ["string"],
  "key_milestones": ["string"],
  "success_criteria": ["string"]
}
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Database schema + migrations
- Invite code system + admin pages
- Basic session management
- API skeleton with auth

**Deliverables:**
- Database with all tables
- Invite code CRUD (admin)
- Session creation via code
- Basic auth middleware

### Phase 2: Conversation System (Weeks 3-4)
- LLM integration (Stage 1 only)
- Conversation storage + retrieval
- Chat UI component
- Message API endpoint
- Real-time message updates (polling or WebSocket)

**Deliverables:**
- Working chat interface
- LLM conversations recorded
- History retrieval

### Phase 3: Plan Generation (Weeks 5-6)
- Stage 2-4 LLM integration
- Plan storage structure
- Async job processing
- Dual output generation (summary + full)

**Deliverables:**
- Structured plan generation
- User summary page
- Admin full plan page

### Phase 4: Email & Notifications (Week 7)
- Email templates (user summary + admin full)
- Email queue jobs
- Download/export functionality
- Email sending integration

**Deliverables:**
- Emails sent to users and admins
- PDF export capability

### Phase 5: Admin Dashboard & Polish (Week 8)
- Admin plan listing/filtering
- Plan export (JSON, PDF)
- Invite code management UI
- Analytics/reporting
- Error handling & edge cases

**Deliverables:**
- Full admin dashboard
- Comprehensive testing
- Documentation

---

## 11. Key Decisions & Trade-offs

| Decision | Option A | Option B | **Selected** | Rationale |
|----------|----------|----------|--------------|-----------|
| LLM Model | GPT-4 Turbo | GPT-4o | **GPT-4** | Reasoning > speed for planning |
| Database | MySQL 8.0+ | **PostgreSQL 12+** | **Either** | Both support JSON well; MySQL is fine if already in use. Use what your team knows best. |
| Real-time Chat | WebSocket | **Polling** | Polling | Simpler, sufficient for use case |
| Conversation Context | Full history | **Windowed + summary** | Windowed + summary | Token efficiency, cost control |
| Export Format | **PDF + JSON** | Just JSON | PDF + JSON | Accessibility + structured data |
| Admin Auth | New table | **Existing roles** | Existing roles | Leverage existing Laravel auth |

---

## 12. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| LLM Hallucinations | High | Strict prompts, fact-check against conversation, schema validation |
| Token Cost Overruns | High | Implement token budgets per stage, monitor usage, set alerts |
| Long Conversations | Medium | Implement summarization after 20 turns, manage context window |
| User Abandonment | Medium | Auto-save drafts, allow pause/resume, email reminders |
| Data Privacy | High | Encrypt stored conversations, GDPR compliance, data retention policy |
| Concurrent Generation | Low | Lock session during plan generation, queue management |

---

## 13. Success Metrics

- **User Engagement**: Sessions completing to plan generation (target: >70%)
- **Plan Quality**: Admin satisfaction scores on generated plans (target: >4/5)
- **Token Efficiency**: Average tokens per session (target: <40K)
- **Cost**: Avg cost per plan (track + optimize)
- **Speed**: Time from session start to plan generation (target: <15 min active time)
- **Accuracy**: Plans generated without hallucinations (target: 100% manual verification required initially)

---

## 14. Future Enhancements

- AI refinement: Fine-tune models on past successful plans
- Collaborative planning: Multiple team members in same session
- Interactive plan builder: User can modify/refine plan post-generation
- Integration exports: Generate boilerplate code/configs for selected tech stack
- Template library: Pre-built solutions for common project types
- Revision history: Track plan iterations and changes
- ROI calculator: Help users prioritize features by value/effort
- Team capacity planner: Link to internal team calendar for resource planning

---

## 15. Voice Chat Implementation (Optional Feature)

### 15.1 Overview

Voice chat is **fully compatible** with the existing framework and requires minimal architectural changes. Users can toggle between text and voice modes at any time. This section details how to add voice capabilities.

### 15.2 Voice Chat Architecture

```
User Records Audio (Web Audio API)
    ↓
Audio Blob → Backend API (/message-voice)
    ↓
Save Raw Audio File (S3/Local Storage)
    ↓
Queue TranscribeAudioJob (async)
    ├─ Whisper API: Convert audio → text
    └─ Update BotConversation with transcribed_text
    ↓
Process as Text Message (Stage 1 LLM)
    ↓
Generate Assistant Response
    ↓
Queue GenerateSpeechJob (if enabled)
    ├─ TTS API: Convert response text → audio
    └─ Save audio file
    ↓
Client polls for completion
    ├─ Receive transcription
    └─ Receive audio (auto-play optional)
```

### 15.3 Frontend Voice Component

**React Component: `VoiceMessageRecorder`**

```jsx
// Key Features:
- Toggle between text/voice modes
- Real-time recording indicator (microphone icon)
- Visual waveform animation (optional)
- Record time counter
- Send on "Stop Recording" button
- Show transcription as it loads
- Play assistant audio response with player controls
- Accessibility: Keyboard shortcuts, screen reader support
- Mobile-friendly: Large touch targets
```

**Implementation Approach:**
```javascript
1. Use Web Audio API to record microphone
2. Store audio as WAV or WebM (browser-native)
3. Convert to MP3/WAV for upload to API
4. Poll /api/sessions/{id}/message/{turn_id}/transcription-status every 2 seconds
5. On transcription complete: Display text + generate LLM response
6. On TTS complete: Show audio player with play/download buttons
```

### 15.4 Backend Services

**New Services to Create:**

```
SpeechService.php
├─ transcribeAudio($audio_file): string
│   ├─ Call Whisper API
│   ├─ Handle errors/timeouts
│   └─ Return transcribed text
│
└─ generateSpeech($text): string
    ├─ Call TTS API
    ├─ Configure voice (optional)
    ├─ Save audio file
    └─ Return audio URL
```

**New Jobs to Create:**

```
TranscribeAudioJob
├─ Input: BotConversation ID, audio file path
├─ Logic:
│   ├─ Call SpeechService::transcribeAudio()
│   ├─ Update BotConversation.user_audio_transcribed = true
│   └─ Trigger next stage (LLM processing)
└─ Error handling: Retry logic, fallback to text-only

GenerateSpeechJob
├─ Input: Assistant message, BotConversation ID
├─ Logic:
│   ├─ Call SpeechService::generateSpeech()
│   ├─ Save audio URL to BotConversation
│   └─ Notify client (webhook or polling)
└─ Error handling: Optional - fail gracefully
```

**Updated ConversationService:**

```
processMessage($session_id, $message_content, $interaction_mode = 'text')
├─ If interaction_mode = 'text':
│   └─ Process as before
├─ If interaction_mode = 'voice':
│   ├─ Queue TranscribeAudioJob
│   ├─ Wait for transcription (polling endpoint)
│   ├─ Process transcribed text via Stage 1 LLM
│   ├─ Generate response
│   ├─ Queue GenerateSpeechJob (optional)
│   └─ Return response + audio URL
└─ If interaction_mode = 'both':
    └─ Store both text and audio
```

### 15.5 API Endpoints (Voice-Specific)

```
POST /api/sessions/{id}/message-voice
  - Auth: Session token
  - Content-Type: multipart/form-data
  - Input: {
      audio: File (Blob),
      format: 'webm' | 'mp3' | 'wav',
      include_tts: boolean (default: true)
    }
  - Process:
    1. Save audio to storage/discovery-bot/sessions/{session_id}/
    2. Create BotConversation record (user_message = null, user_audio_url = set)
    3. Queue TranscribeAudioJob
    4. Return { 
         turn_id, 
         is_processing: true, 
         message: "Transcribing your voice..."
       }
  - Response: 202 (Accepted)

GET /api/sessions/{id}/message/{turn_id}/status
  - Auth: Session token
  - Poll for transcription/speech generation status
  - Output: {
      transcription_status: 'pending' | 'complete' | 'failed',
      transcribed_text?: string,
      assistant_status: 'pending' | 'complete' | 'failed',
      assistant_message?: string,
      assistant_audio_url?: string,
      turn_complete: boolean
    }
  - Response: 200

DELETE /api/sessions/{id}/message/{turn_id}/audio
  - Auth: Session token
  - Soft-delete audio files (keep for compliance, mark as deleted)
  - Output: { deleted: bool }
  - Response: 204 or 404
```

### 15.6 Storage & File Management

**Audio File Organization:**
```
storage/
  discovery-bot/
    sessions/
      {session_id}/
        {turn_id}_user_audio.webm
        {turn_id}_assistant_audio.mp3
        metadata.json (transcriptions, processing status)
```

**Cleanup Strategy:**
```
- Keep raw audio for 30 days (compliance)
- Delete transcribed text after plan generation
- Option: User can delete audio immediately
- Admin can purge all audio for a session
- Schedule: Daily job to clean expired audio
```

### 15.7 Voice Configuration (Session-Level)

Add to `bot_sessions` table:
```sql
- voice_enabled (boolean, default: false)
- voice_mode (enum: text_only, voice_optional, voice_required)
- voice_settings (JSON):
  {
    "enable_tts": true,
    "auto_play_response": false,
    "speaker_voice": "alloy", // openai tts voices
    "transcription_language": "en",
    "audio_quality": "low|med|high"
  }
```

**Admin Can Configure Per Invite Code:**
```
- Voice chat enabled/disabled
- Auto-play responses
- TTS voice preference
```

### 15.8 Cost Breakdown

| Service | Cost | Example |
|---------|------|---------|
| Whisper (Speech-to-Text) | $0.02 per 1 min | ~$0.10 per 5-min session |
| TTS (Text-to-Speech) | $0.015 per 1K chars | ~$0.10 per 1K char response |
| **Total per conversation** | - | ~$0.20-0.30 per session |
| **Text-only session** | - | ~$0.08-0.15 (LLM only) |
| **Delta cost** | +60-100% | +$0.15-0.20 per voice session |

**Optimization Options:**
- Make TTS optional (disabled by default)
- Compress audio before upload
- Cache common responses
- Monitor usage and alert on overages

### 15.9 Quality & Reliability

**Fallback Strategies:**
```
If Whisper fails:
  - Return error: "Couldn't transcribe. Please try typing instead."
  - Offer retry or switch to text mode

If TTS fails:
  - Log error but don't block conversation
  - Message shown: "Response audio unavailable"
  - User can still read text response

Network interruption:
  - Save audio locally first
  - Retry upload with exponential backoff
  - Show upload progress to user
```

**Testing Requirements:**
```
- Unit: Audio encoding, file handling
- Integration: Whisper API mock tests
- End-to-end: Full voice conversation flow
- Performance: Audio file size limits
- Accessibility: Keyboard + screen reader
- Mobile: Different device audio inputs
```

### 15.10 Implementation Timeline (Add-on)

**Phase 2A: Voice Foundation (1-2 weeks)**
- Web Audio API integration
- Audio file handling + storage
- Whisper API integration
- Transcription job system
- Basic UI (record/stop buttons)

**Phase 2B: TTS & Polish (1 week)**
- TTS API integration
- Audio playback component
- Voice settings config
- Mobile optimization
- Accessibility audit

**Effort:** ~2-3 additional weeks (can run parallel to text implementation)

### 15.11 Voice Chat Considerations

**Pros:**
- ✅ More natural UX for discovery conversations
- ✅ Captures tone/emotion better than text
- ✅ Faster input (speaking > typing for many users)
- ✅ Better accessibility for dyslexic users
- ✅ Mobile-friendly
- ✅ Minimal backend changes needed

**Cons:**
- ❌ Additional API costs (+60-100% per session)
- ❌ Privacy concerns (audio data)
- ❌ Background noise challenges
- ❌ Accents/speech recognition edge cases
- ❌ Mobile permissions (microphone access)

**Recommendation:**
```
Phase 1 (MVP): Text-only for core functionality
Phase 2: Add voice as optional enhancement
Monitor: User engagement + cost impact
Decision: Expand or optimize voice based on usage
```

---

## 16. Development Guidelines

### 16.1 Code Organization

```
app/
  DiscoveryBot/
    Services/
      ConversationService.php (manage turns, context)
      LLMService.php (call OpenAI, handle responses)
      RequirementExtractionService.php (Stage 2)
      PlanGenerationService.php (Stage 3)
      SummaryGenerationService.php (Stage 4)
      SpeechService.php (Whisper + TTS - optional)
    Jobs/
      ExtractRequirementsJob.php
      GeneratePlanJob.php
      GenerateSummaryJob.php
      SendPlanEmailJob.php
      TranscribeAudioJob.php (optional)
      GenerateSpeechJob.php (optional)
    Models/
      BotSession.php
      BotConversation.php
      DiscoveryPlan.php
      InviteCode.php
    Http/
      Controllers/
        BotSessionController.php
        BotConversationController.php
        PlanController.php
        AdminInviteCodeController.php
      Requests/
        ValidateInviteRequest.php
        SendMessageRequest.php
        SendVoiceMessageRequest.php (optional)
```

### 16.2 Testing Strategy

- Unit: Service classes (LLM mocking)
- Feature: API endpoints, auth flows
- Integration: Full conversation → plan generation flow
- Contract: OpenAI API responses
- Voice (optional): Audio handling, Whisper/TTS mocking

### 16.3 Documentation

- API documentation (OpenAPI/Swagger)
- Prompt engineering changelog (track prompt improvements)
- Admin user manual
- User onboarding guide
- Voice chat setup guide (if enabled)

---

## Appendix: Quick Start Checklist

- [ ] Design database schema (validate with team)
- [ ] Set up PostgreSQL + migrations
- [ ] Create invite code system
- [ ] Implement session management
- [ ] Build API auth middleware
- [ ] Create chat UI components
- [ ] Integrate OpenAI API (Stage 1 first)
- [ ] Build conversation persistence
- [ ] Implement Stages 2-4 LLM
- [ ] Create plan storage & retrieval
- [ ] Build email system
- [ ] Create admin dashboard
- [ ] **[OPTIONAL]** Integrate Whisper for voice transcription
- [ ] **[OPTIONAL]** Integrate TTS for voice responses
- [ ] **[OPTIONAL]** Build voice UI component
- [ ] Comprehensive testing
- [ ] Documentation & deployment

---

**Document Version:** 2.0  
**Last Updated:** December 22, 2025  
**Status:** Ready for Review & Development  
**Includes:** Optional Voice Chat Implementation Plan
