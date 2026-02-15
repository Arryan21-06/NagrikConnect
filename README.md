NagrikConnect

AI-powered civic grievance platform — making public systems accessible, accountable, and fair for every Indian citizen.

Overview
NagrikConnect is an AI-assisted civic workflow engine that sits between citizens and municipal departments to ensure every grievance is understood, routed correctly, and never dies in silence.
It is not a chatbot. It is not a complaint form. It is a full-stack governance intelligence layer that combines:

Multilingual, voice-first citizen input — no app, no literacy required
Confidence-based AI automation — routes intelligently, flags what needs human review
Escalation enforcement — deadlines with automatic escalation chains
Bias monitoring — audits AI decisions across language, region, and demographic dimensions
Low-maturity municipality compatibility — works for ULBs with zero existing digital infrastructure


Problem Statement
India has over 4,000 Urban Local Bodies (ULBs). The majority lack functional digital grievance systems. Citizens who report a broken streetlight, a blocked drain, or a water supply failure have no reliable way to:

Know if their complaint was received
Track what department it went to
Escalate if nothing happens
Verify it was actually resolved

Existing platforms fail because they require smartphone apps, enforce English-only forms, or rely entirely on manual routing by underfunded civic staff.
NagrikConnect addresses this gap directly — accessible via WhatsApp or SMS, in Hindi, Tamil, Telugu, English, or Hinglish, with voice message support for low-literacy users.

Key Features
For Citizens

Report via WhatsApp, SMS, or voice message — no app required
Write in any of 5+ supported languages, including Hinglish
Receive real-time acknowledgment and status updates
Confirm or dispute resolution outcomes

For Municipal Departments

AI-pre-classified, pre-routed complaints with confidence scores
Batch triage interface — 50 complaints per batch, AI-assisted, one-click operations
Escalation alerts with full audit trail
Hotspot analytics and performance dashboards

For Administrators

Bias audit dashboard — language accuracy variance, regional severity variance
Model drift detection with retraining triggers
Immutable complaint history — every AI decision explained and logged
Abuse and spam detection with quarantine queues


System Architecture
┌─────────────────────────────────────────────────────────────────────┐
│                        CITIZEN INPUT LAYER                          │
│          WhatsApp Business API  ·  SMS  ·  Voice  ·  Web            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CHANNEL INTERFACE SERVICE                         │
│     Message reception · Metadata extraction · Media compression      │
│              Retry queueing · SMS fallback routing                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   LANGUAGE PROCESSING PIPELINE                       │
│   Voice → Whisper STT (conf ≥0.80)   │   Text → FastText LangDetect │
│          NLLB-200 Translation          │   Confidence scoring         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   COMPLAINT PROCESSING ENGINE                        │
│   NER (BERT/RoBERTa) · Multi-label categorization · Location NLP    │
│       Clarification prompts · Severity scoring · Duplicate check    │
└─────────────┬──────────────────────────────┬────────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────┐          ┌─────────────────────────────────┐
│  IMAGE VERIFICATION  │          │       CONFIDENCE ENGINE          │
│  YOLO · CLIP · Auth  │          │  Aggregate score → Route tier   │
│  score (non-blocking)│          │  ≥0.90 auto · 0.70 flag · <0.70 │
└─────────────────────┘          │  human queue                    │
                                  └──────────────┬──────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ROUTING & ESCALATION ENGINE                     │
│    Department Registry lookup · Rejection loop prevention            │
│    72hr ack · 7-day supervisor · 14-day authority escalation         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESOLUTION VERIFICATION LOOP                      │
│   Department marks resolved → Citizen confirmation (7-day window)   │
│        No response = unverified · Denied = reopen + escalate        │
└─────────────────────────────────────────────────────────────────────┘

AI Pipeline
1. Language Processing
ComponentModelPurposeSpeech-to-TextOpenAI WhisperVoice complaint transcriptionLanguage DetectionFastText (lid.176)Identify input languageTranslationNLLB-200Normalize to processing languageConfidence gatingCustom threshold (0.80)Trigger clarification if uncertain
2. Complaint Intelligence
ComponentModelPurposeNER + ClassificationFine-tuned BERT / RoBERTaIssue type, location, severity entitiesMulti-label taggingEmbedding similarityCivic taxonomy (roads, water, sanitation, etc.)Complex extractionLLM fallbackEdge cases with ambiguous complaints
3. Image Verification
ComponentModelPurposeObject detectionYOLOv8Identify relevant objects in photosRelevance scoringCLIPMatch image to complaint categoryAuthenticity checkCustom scorerFlag likely synthetic/irrelevant images

Design principle: Low image authenticity never auto-rejects a complaint. It only lowers routing confidence. Citizen trust is protected.

4. Duplicate Detection
Similarity score is computed as a weighted combination:
similarity = (text_embedding_cosine × 0.50)
           + (location_proximity_score × 0.30)
           + (temporal_proximity_score × 0.20)
ScoreAction≥ 0.90Auto-link to existing complaint0.70 – 0.89Flag for manual review< 0.70Treat as distinct complaint
Mass reporting (e.g., 100 pothole reports within 20m) is collapsed into one master ticket. Every citizen still receives acknowledgment.
5. Severity Scoring
severity (0–100) = (issue_type_weight × 0.40)
                 + (safety_keywords × 0.30)
                 + (affected_population × 0.20)
                 + (temporal_urgency × 0.10)
LevelScore RangeExampleCritical80–100Open manhole, flooding, fire hazardHigh60–79No water supply, road collapseMedium40–59Broken streetlight, damaged footpathLow0–39Park maintenance, minor signage
6. Confidence Engine & Routing Tiers
overall_confidence = weighted_avg(
    language_confidence,
    category_confidence,
    image_confidence,       # 0 if no image provided
    duplicate_confidence
)
ConfidenceRouting Action≥ 0.90Auto-route to department0.70 – 0.89Auto-route + flagged for human review< 0.70Held in smart human review queue

Tech Stack
LayerTechnologyAPI BackendFastAPI (Python)DatabasePostgreSQLMessage QueueRabbitMQCacheRedisAI ModelsWhisper, NLLB-200, BERT/RoBERTa, YOLOv8, CLIPCitizen ChannelWhatsApp Business API, SMS gatewayAuthJWT (admin)EncryptionHTTPS + AES-256 PII at restHostingCloud VM (AWS / GCP / Azure)

Getting Started
Prerequisites
bashPython 3.10+
PostgreSQL 14+
Redis 7+
RabbitMQ 3.11+
Node.js 18+ (for WhatsApp webhook)
Installation
bash# Clone the repository
git clone https://github.com/your-org/nagrikconnect.git
cd nagrikconnect

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# Edit .env with your database, Redis, and API credentials

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
Environment Variables
env# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nagrikconnect

# Cache
REDIS_URL=redis://localhost:6379

# Queue
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# WhatsApp Business API
WHATSAPP_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id

# AI Models (local paths or HuggingFace IDs)
WHISPER_MODEL=openai/whisper-medium
NLP_MODEL=path/to/finetuned-bert-civic
NLLB_MODEL=facebook/nllb-200-distilled-600M

# Auth
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=60

# Admin
ADMIN_EMAIL=admin@your-municipality.gov.in
Running with Docker
bashdocker-compose up --build
The API will be available at http://localhost:8000. Admin dashboard at http://localhost:8000/admin.

API Reference
Submit a Complaint
httpPOST /api/v1/complaints
Content-Type: application/json

{
  "channel": "whatsapp",
  "phone_number": "+919XXXXXXXXX",
  "message_text": "मेरे इलाके में पानी 3 दिन से नहीं आ रहा है। वार्ड 12, मालवीय नगर।",
  "media_url": "https://...",   // optional
  "location": {
    "lat": 28.5355,
    "lng": 77.2090
  }
}
Response:
json{
  "complaint_id": "NC-2026-00847",
  "status": "acknowledged",
  "category": "water_supply",
  "severity": "high",
  "department": "Jal Board – South Zone",
  "confidence_score": 0.87,
  "estimated_resolution": "2026-02-22",
  "message": "आपकी शिकायत दर्ज कर ली गई है। ID: NC-2026-00847"
}
Track a Complaint
httpGET /api/v1/complaints/{complaint_id}
Admin: Batch Triage
httpGET /api/v1/admin/triage/batch?size=50&confidence_max=0.89
Authorization: Bearer <jwt_token>
Admin: Bias Audit Report
httpGET /api/v1/admin/bias/report?dimension=language&days=30
Authorization: Bearer <jwt_token>

Responsible AI & Bias Monitoring
NagrikConnect treats fairness as a first-class system requirement, not an afterthought.
What is monitored
DimensionMetricThresholdLanguage accuracyTranscription + classification accuracy per languageVariance > 10% triggers auditRegional severitySeverity scores for identical issue types across districtsVariance > 15% triggers auditRouting successDepartment acceptance rate by complaint origin regionDrop > 10% triggers reviewResolution timeTime-to-resolution by language and regionDisparity > 20% triggers review
On bias detection
When variance exceeds thresholds:

Audit is automatically triggered and logged
Corrective weighting is applied to the affected model dimension
Override data is collected for the next retraining cycle

Explainability
Every AI decision includes a structured explanation:
json{
  "category_reasoning": "Keyword 'पानी नहीं' matched water_supply with 0.91 confidence. Secondary match: sanitation (0.34).",
  "routing_rationale": "Primary department: Jal Board South Zone (water_supply + Ward 12 location).",
  "severity_factors": "Issue type: high (0.72). Safety keywords absent. Affected population: medium density area.",
  "confidence_breakdown": {
    "language": 0.94,
    "category": 0.91,
    "image": null,
    "duplicate": 0.88,
    "overall": 0.91
  }
}
Model Monitoring & Retraining
SignalThresholdActionAccuracy drop> 5% over 7 daysAlert + manual reviewHuman override rate> 15% of routed complaintsRetraining triggerDistribution shiftKL divergence > 0.15Drift alert
Retraining pipeline: collect overrides → augment dataset → validate → A/B test → deploy.

Low-Maturity Municipality Mode
For ULBs with no API infrastructure or technical capacity:
FeatureImplementationComplaint intakeWeb-based portal (no app required)Department actionsOne-click acknowledge / update statusData exportCSV export for offline processingField officer updatesSMS-based status pushInternal coordinationWhatsApp bot for staff
This mode requires zero API integration on the municipality's side. It is designed to work with a single smartphone and a stable internet connection.

Escalation Engine
StageTriggerActionAcknowledgment72 hours after submissionAuto-escalate to supervisor if unacknowledgedSupervisor review7 days after submissionEscalate to higher authorityAuthority review14 days after submissionExecutive escalation + public dashboard flag
Rejection loop prevention:

1st rejection → AI suggests alternative department
2nd rejection → Coordination authority notified
3rd+ rejection → Executive review queue + escalation logged

Citizens are notified at every stage via their original channel (WhatsApp or SMS).

Roadmap
Phase 1 — MVP (Current)

 System architecture and AI pipeline design
 Low-maturity municipality mode specification
 Bias monitoring framework
 FastAPI backend with core complaint flow
 WhatsApp webhook integration
 Basic admin triage dashboard

Phase 2 — Pilot

 Fine-tune BERT on annotated civic Hindi/Tamil corpus
 Deploy Whisper STT with regional dialect support
 Partner with 2–3 ULBs for pilot program
 DPDP Act 2023 compliance audit

Phase 3 — Scale

 Full retraining pipeline with A/B deployment
 Public performance dashboards (citizen-facing)
 Hotspot analytics for city planning integration
 Integration with national grievance portal (CPGRAMS)


Contributing
Contributions are welcome. Please read the contribution guidelines before opening a pull request.
bash# Fork the repo and create your branch
git checkout -b feature/your-feature-name

# Run tests
pytest tests/

# Submit a PR with a clear description of what changed and why
Areas where help is especially needed:

Annotated civic corpus for Hindi, Tamil, and Telugu NLP fine-tuning
Field research — interviews with ULB officials and frontline civic workers
UX research — usability testing with low-literacy users


Data Privacy
NagrikConnect handles citizen PII (phone numbers, location data, complaint content). All data is:

Encrypted at rest (AES-256) and in transit (HTTPS/TLS 1.3)
Retained only for the duration required by municipal grievance rules
Never shared with third parties outside the responsible department

Compliance with the Digital Personal Data Protection Act 2023 (DPDP Act) is a Phase 2 roadmap item currently under legal review.
