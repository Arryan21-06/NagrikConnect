# Design Document: NagrikConnect

## Overview

NagrikConnect is an AI-powered civic access platform that democratizes access to government services through intelligent complaint processing, routing, and tracking. The system is designed as a microservices architecture with distinct AI/ML pipelines for language processing, duplicate detection, severity analysis, and image verification.

The design emphasizes:
- **Accessibility-first**: Low-bandwidth support, voice input, regional languages
- **AI reliability**: Confidence scoring, human-in-the-loop for low-confidence decisions
- **Operational resilience**: Cascading failure handling, department non-response escalation
- **Fairness**: Language and geographic bias detection with corrective mechanisms
- **Transparency**: Explainable decisions, public performance dashboards

## Architecture

### High-Level Architecture

The system follows an event-driven microservices architecture with the following layers:

1. **Input Channels**: WhatsApp Business API, SMS Gateway
2. **Channel Interface**: Message reception, queuing, retry logic
3. **AI Processing Pipeline**: Language, complaint, image, duplicate, severity processing
4. **Routing & Coordination**: Department matching, multi-party coordination
5. **Status & Notification**: Lifecycle tracking, escalation, citizen updates
6. **Analytics & Monitoring**: Public dashboards, bias detection, model monitoring
7. **Data Layer**: Complaint, user, department, analytics, time-series databases

### Architecture Principles

1. **Event-Driven Processing**: Components communicate via message queues
2. **Microservices**: Each AI component is independently deployable
3. **Confidence-Based Routing**: Low-confidence decisions trigger human review
4. **Graceful Degradation**: System continues with reduced AI capabilities during failures
5. **Audit-First**: All decisions, overrides, and escalations are logged immutably

## Components and Interfaces

### 1. Channel Interface Service

Manages communication with WhatsApp and SMS, handles message queuing and retry logic.

**Key Operations**:
- `receiveMessage(channel, sender, content, metadata)`
- `sendMessage(channel, recipient, content, language)`
- `compressImage(image)` - for low-bandwidth transmission
- `queueForRetry(message, retryCount)` - handles intermittent connectivity

**Error Handling**:
- Network failures: Exponential backoff retry (max 5 attempts)
- Invalid format: Return error in citizen's language
- Rate limiting: 10 messages per citizen per 24 hours

### 2. Language Processor

Handles multilingual text and voice processing, translation, and transcription.

**Key Operations**:
- `detectLanguage(text)` - returns language + confidence
- `transcribeVoice(audio, expectedLanguage)` - voice to text
- `translateToStandard(text, sourceLanguage)` - to English
- `translateToTarget(text, targetLanguage)` - to citizen's language
- `computeLanguageConfidence(text, detectedLanguage)` - [0-1]

**AI Models**:
- Language detection: FastText
- Speech-to-text: Whisper or regional models
- Translation: NLLB-200

**Confidence Thresholds**:
- Language detection: >0.85 for auto-processing
- Transcription: >0.80 for auto-processing
- Translation: >0.75 for auto-processing

**Bias Mitigation**:
- Track accuracy per language (30-day rolling window)
- Flag languages with <85% accuracy
- Apply language-specific confidence adjustments

### 3. Complaint Processor

Extracts structured information from unstructured complaints, orchestrates AI pipeline.

**Key Operations**:
- `extractInformation(text)` - NER for issue type, location, details
- `categorizeComplaint(text, images)` - assigns categories + confidence
- `computeOverallConfidence(...)` - aggregates all confidence scores
- `requestClarification(complaintId, missingFields)`
- `logMisclassification(...)` - records errors for retraining

**AI Models**:
- NER: Fine-tuned BERT/RoBERTa for civic domain
- Categorization: Multi-label classifier on civic taxonomy
- Information extraction: Seq2seq or prompt-based LLM

**Confidence Computation**:
```
overallConfidence = weightedAverage([
  (languageConfidence, 0.25),
  (categoryConfidence, 0.35),
  (imageConfidence, 0.20),
  (duplicateConfidence, 0.20)
])
```

**Routing Logic**:
- ≥0.90: Auto-route
- 0.70-0.89: Route with review flag
- <0.70: Mandatory human review

### 4. Image Verifier

Validates image authenticity, extracts visual information, detects manipulation.

**Key Operations**:
- `validateFormat(image)` - checks format and size
- `detectManipulation(image)` - identifies tampering
- `extractVisualFeatures(image)` - objects, text, conditions
- `computeAuthenticityScore(image)` - [0-1]
- `computeRelevanceScore(image, complaintText)` - alignment score

**AI Models**:
- Manipulation: ELA + CNN-based detector
- Object detection: YOLO for civic infrastructure
- OCR: Tesseract or PaddleOCR
- Image-text alignment: CLIP

**Thresholds**:
- Authenticity: >0.60 to accept
- Relevance: >0.70 for categorization
- Quality: Minimum 480x640 resolution

### 5. Duplicate Detector

Identifies similar complaints to prevent redundant processing.

**Key Operations**:
- `computeSimilarity(newComplaint, existingComplaints)`
- `detectDuplicate(complaintId, threshold)`
- `linkComplaints(id1, id2, confidence)`
- `unlinkComplaints(id1, id2, reason)` - removes false positives
- `logFalsePositive(id1, id2)` - for model improvement

**Similarity Computation**:
```
similarity = weightedAverage([
  (textSimilarity, 0.50),      // Cosine similarity of embeddings
  (locationProximity, 0.30),   // Geographic distance
  (temporalProximity, 0.20)    // Time difference
])
```

**Thresholds**:
- ≥0.90: Auto-link as duplicate
- 0.70-0.89: Flag for manual verification
- <0.70: Treat as distinct

**AI Models**:
- Text embeddings: Sentence-BERT
- Location: Geohash-based proximity

### 6. Severity Analyzer

Assesses complaint urgency and impact for prioritization.

**Key Operations**:
- `assessSeverity(complaint)` - returns score [0-100]
- `identifySeverityFactors(complaint)` - explains reasoning
- `normalizeSeverity(score, language, region)` - bias corrections

**Severity Factors**:
1. Issue Type (40%): Predefined severity by category
2. Public Safety Impact (30%): Danger/health keywords
3. Affected Population (20%): Estimated impact
4. Temporal Urgency (10%): Time-sensitive keywords

**Severity Levels**:
- Critical (80-100): <24hr response
- High (60-79): <72hr response
- Medium (40-59): <7 day response
- Low (0-39): <30 day response

**Bias Mitigation**:
- Track severity by language and region
- Flag regions with >20% deviation
- Apply corrective multipliers

### 7. Issue Router

Routes complaints to appropriate departments, handles rejections and escalations.

**Key Operations**:
- `identifyDepartment(complaint)` - determines responsible dept(s)
- `routeComplaint(complaintId, departmentId, confidence)`
- `handleRejection(complaintId, departmentId, reason)`
- `escalateToCoordination(complaintId, rejectionHistory)`
- `routeMultiDepartment(...)` - handles complex issues

**Routing Logic**:
1. Query Department_Registry by (issueType, location)
2. Single match: Route to that department
3. Multiple matches: Identify primary + secondary
4. No match: Route to default coordination office
5. Confidence <0.70: Add to human review queue

**Rejection Handling**:
- 1 rejection: Suggest alternatives
- 2 rejections: Escalate to coordination authority
- ≥3 rejections: Trigger executive review

### 8. Status Tracker

Monitors complaint lifecycle, triggers escalations, manages deadlines.

**Key Operations**:
- `updateStatus(complaintId, newStatus, actor)`
- `checkDeadlines()` - periodic check for overdue
- `triggerEscalation(complaintId, escalationType)`
- `requestCitizenConfirmation(complaintId)`
- `handleConfirmation(complaintId, confirmed)`

**Status States**:
1. SUBMITTED
2. PROCESSING
3. ROUTED
4. ACKNOWLEDGED
5. IN_PROGRESS
6. RESOLVED_PENDING
7. VERIFIED_RESOLVED
8. UNVERIFIED_RESOLVED
9. REOPENED
10. ESCALATED

**Deadline Management**:
- Acknowledgment: 72 hours
- Supervisor escalation: 7 days without ack
- Higher authority: 14 days without ack
- Resolution: Based on severity

### 9. Notification Service

Sends updates to citizens in their language via preferred channel.

**Key Operations**:
- `sendStatusUpdate(complaintId, citizenId, status)`
- `sendEscalationNotice(complaintId, citizenId, details)`
- `requestConfirmation(complaintId, citizenId)`
- `sendExplanation(complaintId, citizenId, decision)`
- `translateMessage(message, targetLanguage)`

**Message Templates**:
- Status: "Your complaint #{id} about {issueType} is now {status}"
- Escalation: "Escalated to {authority} due to {reason}"
- Confirmation: "Has your issue been resolved? Reply YES or NO"
- Explanation: "Categorized as {category} because {reasons}"

### 10. Analytics Engine

Generates public dashboards, hotspot maps, performance metrics, bias reports.

**Key Operations**:
- `generateHotspotMap(timeRange, issueType, region)`
- `computePerformanceMetrics(department, timeRange)`
- `detectBiasPatterns(dimension)`
- `generatePublicDashboard()`
- `exportReport(format, filters)`

**Key Metrics**:
- Resolution Rate: (Verified + Unverified Resolved) / Total
- Verified Resolution Rate: Verified / Total Resolved
- Average Resolution Time: Mean time to verified resolution
- Acknowledgment Rate: Acked within 72hr / Total Routed
- Escalation Rate: Escalated / Total
- Language Accuracy: Correct categorizations / Total by language
- Geographic Equity: CV of resolution times across regions

### 11. Bias Detector

Monitors for systematic biases in AI decisions and outcomes.

**Key Operations**:
- `trackLanguageAccuracy(language, timeWindow)`
- `trackRegionalEquity(region, timeWindow)`
- `detectSeverityBias(dimension)`
- `detectRoutingBias(dimension)`
- `triggerBiasAudit(biasType, evidence)`
- `applyCorrectiveWeighting(biasType, magnitude)`

**Bias Detection Thresholds**:
- Language accuracy variance: >10% triggers audit
- Regional response time variance: >20% triggers investigation
- Severity score variance: >15% by region triggers audit
- Resolution rate variance: >15% by language triggers investigation

**Corrective Actions**:
1. Flag for investigation
2. Apply temporary corrective multipliers
3. Queue for human review
4. Trigger model retraining
5. Log all corrections

### 12. Model Monitor

Tracks AI model performance, detects drift, triggers retraining.

**Key Operations**:
- `trackAccuracy(model, timeWindow)`
- `detectDrift(model, baseline)`
- `trackOverrideRate(model)`
- `detectDistributionShift(model)`
- `triggerRetraining(model, reason)`
- `runABTest(oldModel, newModel, duration)`

**Drift Detection**:
- Accuracy drop: >5% from baseline triggers alert
- Override rate: >15% triggers retraining
- Distribution shift: KL divergence >0.3 triggers evaluation

**Retraining Process**:
1. Collect misclassifications and overrides
2. Augment training data with corrections
3. Train new model with balanced data
4. Validate on held-out test set
5. Run A/B test for 7 days
6. Promote if improvement >3%

## Data Models

### Complaint
```typescript
interface Complaint {
  id: string;
  citizenId: string;
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  voiceAudioUrl?: string;
  images: Image[];
  channel: 'whatsapp' | 'sms';
  submittedAt: timestamp;
  
  issueType: string;
  categories: string[];
  location: GeoLocation;
  description: string;
  
  languageConfidence: number;
  categoryConfidence: number;
  imageConfidence: number;
  duplicateConfidence: number;
  overallConfidence: number;
  
  severityScore: number;
  severityLevel: 'critical' | 'high' | 'medium' | 'low';
  severityFactors: string[];
  
  assignedDepartments: DepartmentAssignment[];
  primaryCoordinator?: string;
  routingConfidence: number;
  
  status: ComplaintStatus;
  statusHistory: StatusChange[];
  
  duplicateOf?: string;
  linkedComplaints: string[];
  
  escalationHistory: Escalation[];
  
  resolvedAt?: timestamp;
  resolutionVerified: boolean;
  citizenFeedback?: Feedback;
  
  aiDecisionExplanations: Explanation[];
  humanOverrides: Override[];
  
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Citizen
```typescript
interface Citizen {
  id: string;
  phoneNumber: string;
  preferredLanguage: string;
  preferredChannel: 'whatsapp' | 'sms';
  location?: GeoLocation;
  complaintCount: number;
  lastComplaintAt?: timestamp;
  spamScore: number;
  verifiedComplaints: number;
  falseReports: number;
  dataRetentionConsent: boolean;
  anonymizeInPublicData: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Department
```typescript
interface Department {
  id: string;
  name: string;
  nameTranslations: Map<string, string>;
  issueTypes: string[];
  geographicJurisdiction: GeoRegion[];
  integrationEndpoint?: string;
  integrationFormat: 'api' | 'email' | 'manual';
  averageResolutionTime: number;
  resolutionRate: number;
  acknowledgmentRate: number;
  escalationRate: number;
  supervisorContact: string;
  escalationContact: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### BiasMetric
```typescript
interface BiasMetric {
  dimension: 'language' | 'region' | 'issue_type';
  dimensionValue: string;
  complaintCount: number;
  averageConfidence: number;
  averageSeverity: number;
  routingAccuracy: number;
  resolutionRate: number;
  averageResolutionTime: number;
  confidenceDeviation: number;
  severityDeviation: number;
  resolutionTimeDeviation: number;
  biasDetected: boolean;
  auditTriggered: boolean;
  correctiveActionApplied: boolean;
  timeWindow: { start: timestamp, end: timestamp };
  computedAt: timestamp;
}
```

### ModelPerformance
```typescript
interface ModelPerformance {
  modelName: string;
  modelVersion: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  averageConfidence: number;
  confidenceAccuracyCorrelation: number;
  overrideRate: number;
  overrideReasons: Map<string, number>;
  baselineAccuracy: number;
  currentAccuracy: number;
  driftMagnitude: number;
  driftDetected: boolean;
  inputDistribution: Map<string, number>;
  distributionShift: number;
  timeWindow: { start: timestamp, end: timestamp };
  computedAt: timestamp;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

1. **Language Processing**: Properties 2.1, 2.3, and 26.1 all test language processing accuracy - can be combined into comprehensive language processing property
2. **Confidence Scoring**: Properties 21.1, 22.1, 28.1, and 29.1 all test confidence score generation - can be combined
3. **Routing Logic**: Properties 7.1, 28.2, and 28.4 all test routing decisions - can be combined into confidence-based routing property
4. **Status Tracking**: Properties 8.1, 9.1, and 19.1 all test status management - can be combined
5. **Escalation**: Properties 23.3 and 24.3 both test escalation triggers - can be combined
6. **Bias Detection**: Properties 26.1, 26.8, and 27.1 all test bias monitoring - can be combined

The following properties represent the unique, non-redundant correctness guarantees:

### Core Processing Properties

**Property 1: Language Detection and Translation Accuracy**

*For any* text or voice input in a supported regional language, the Language_Processor should correctly identify the language with confidence >0.85, transcribe voice to text with confidence >0.80, and translate to the standard processing language while preserving semantic meaning.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

**Property 2: Information Extraction Completeness**

*For any* unstructured complaint text, the Complaint_Processor should extract all present key information fields (issue type, location, relevant details) or explicitly request clarification for missing required fields.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

**Property 3: Image Authenticity and Relevance Scoring**

*For any* submitted image, the Image_Verifier should compute both an authenticity confidence score [0-1] and a relevance confidence score [0-1], flagging images with authenticity <0.60 or relevance <0.70 for human verification.

**Validates: Requirements 4.2, 4.3, 4.4, 29.1, 29.5, 29.6**

**Property 4: Multi-Image Consistency Validation**

*For any* complaint with multiple images, the Image_Verifier should cross-validate consistency across all images and flag inconsistencies for investigation.

**Validates: Requirements 29.8, 29.9**

### Duplicate Detection Properties

**Property 5: Duplicate Detection with Confidence Scoring**

*For any* new complaint, the Duplicate_Detector should compute similarity scores against all existing complaints using weighted text similarity (0.50), location proximity (0.30), and temporal proximity (0.20), assigning appropriate confidence levels: auto-link if ≥0.90, flag for manual verification if 0.70-0.89, treat as distinct if <0.70.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 22.1, 22.2**

**Property 6: Duplicate Linking and Unlinking**

*For any* detected duplicate with confidence ≥0.90, the Duplicate_Detector should link the complaints and synchronize their status updates; for any false positive duplicate, the system should accept unlinking requests and separate status tracking.

**Validates: Requirements 5.5, 5.6, 22.3, 22.4, 22.5**

### Severity and Routing Properties

**Property 7: Severity Assessment with Bias Normalization**

*For any* complaint, the Severity_Analyzer should compute a severity score [0-100] based on issue type (40%), public safety impact (30%), affected population (20%), and temporal urgency (10%), then normalize the score to correct for language and geographic biases before assigning a severity level.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 27.1, 27.2**

**Property 8: Confidence-Based Routing Logic**

*For any* processed complaint with overall confidence score computed from language (0.25), category (0.35), image (0.20), and duplicate (0.20) confidences, the Issue_Router should: auto-route if confidence ≥0.90, route with review flag if 0.70-0.89, or queue for mandatory human review if <0.70.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8**

**Property 9: Multi-Department Coordination**

*For any* complaint requiring multiple departments, the Issue_Router should identify all responsible parties, designate a primary coordinator, specify each department's responsibility, and track progress across all departments with unified status updates.

**Validates: Requirements 33.1, 33.2, 33.3, 33.4, 33.5, 33.8**

### Status Tracking and Escalation Properties

**Property 10: Status Tracking with Audit Trail**

*For any* complaint status change, the Status_Tracker should detect the change, log it with timestamp and responsible party, update the citizen via their preferred channel, and maintain complete status history for audit purposes.

**Validates: Requirements 8.1, 8.2, 8.3, 9.1, 9.2, 9.3, 9.4, 19.1, 19.3**

**Property 11: Deadline-Based Escalation**

*For any* routed complaint, the Status_Tracker should set an acknowledgment deadline of 72 hours; if unacknowledged after 7 days, escalate to department supervisor; if unacknowledged after 14 days, escalate to higher authority; and trigger resolution deadline escalation when severity-based deadlines are missed.

**Validates: Requirements 24.1, 24.2, 24.3, 24.4, 24.5, 24.7**

**Property 12: Rejection Loop Prevention**

*For any* complaint rejected by a department, the Issue_Router should require a rejection reason; after 2 rejections by different departments, escalate to coordination authority; after 3+ rejections, trigger executive-level review.

**Validates: Requirements 23.1, 23.2, 23.3, 23.4, 23.7**

**Property 13: Resolution Verification**

*For any* complaint marked resolved by a department, the Status_Tracker should require citizen confirmation within 7 days, send a second request if no response, mark as verified-resolved if confirmed, reopen with escalated priority if denied, or mark as unverified-resolved after 14 days without response.

**Validates: Requirements 25.1, 25.2, 25.3, 25.4, 25.5, 25.6**

### AI Reliability and Error Handling Properties

**Property 14: Misclassification Detection and Correction**

*For any* complaint categorization with confidence <0.75, the Complaint_Processor should flag for human review; for any reclassification request from departments or citizens, the Issue_Router should accept it, reroute to the correct department, notify the citizen, and log the misclassification for model retraining.

**Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7**

**Property 15: Cascading Failure Graceful Degradation**

*For any* AI component failure (Language_Processor, Duplicate_Detector, Severity_Analyzer, Image_Verifier), the system should continue operating in fallback mode, route to human operators, log the degradation period, and reprocess queued complaints upon recovery.

**Validates: Requirements 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8**

**Property 16: Model Drift Detection and Retraining**

*For any* AI model, the Model_Monitor should track accuracy over rolling 30-day windows; trigger drift alert if accuracy drops >5% from baseline; trigger retraining recommendation if override rate exceeds 15%; and run A/B testing for 7 days before promoting new models.

**Validates: Requirements 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.9, 31.10**

### Bias Detection and Fairness Properties

**Property 17: Language Bias Detection and Mitigation**

*For any* supported language, the Language_Processor should track accuracy metrics; flag languages with <85% accuracy for model improvement; track routing accuracy across languages; trigger bias investigation if routing accuracy varies by >10%; and apply corrective weighting when bias is detected.

**Validates: Requirements 26.1, 26.2, 26.5, 26.6, 26.8**

**Property 18: Geographic Bias Detection and Equity Adjustment**

*For any* geographic region, the Severity_Analyzer should track scoring patterns; trigger bias audit if a region shows systematically lower severity scores (>20% deviation); track response times by region; flag for investigation if response times vary by >20%; and apply equity adjustments when bias patterns are identified.

**Validates: Requirements 27.1, 27.2, 27.3, 27.4, 27.7, 27.8**

### Security and Privacy Properties

**Property 19: PII Encryption and Anonymization**

*For any* citizen data stored in the system, the Complaint_Processor should encrypt all personally identifiable information; for any public analytics display, the Analytics_Engine should anonymize all citizen identities; and for any data access, the system should log who accessed what data and when.

**Validates: Requirements 13.1, 13.2, 13.3, 13.5**

**Property 20: Spam Detection and Quarantine**

*For any* incoming complaint, the Complaint_Processor should compute a spam score; quarantine complaints with spam score >0.80; flag citizens submitting >10 complaints in 24 hours; flag identical text from multiple citizens as coordinated activity; and adjust spam detection thresholds if false positive rates exceed 10%.

**Validates: Requirements 32.1, 32.2, 32.3, 32.4, 32.5, 32.8, 32.9**

### Analytics and Transparency Properties

**Property 21: Hotspot Map Aggregation**

*For any* time period and optional issue type filter, the Analytics_Engine should aggregate complaints by geographic location, group by issue type, calculate density metrics, and visualize high-density areas prominently.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

**Property 22: Performance Metrics Calculation**

*For any* department and time range, the Analytics_Engine should calculate resolution rates, average resolution time, complaint volume trends, citizen satisfaction scores, distinguish between verified and unverified resolutions, and show comparisons across departments and trends over time.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 25.7**

**Property 23: AI Decision Explainability**

*For any* AI decision (categorization, routing, severity assessment), the system should generate an explanation identifying key phrases or factors that influenced the decision, provide routing rationale with jurisdiction rules, and deliver explanations in the citizen's language upon request.

**Validates: Requirements 34.1, 34.2, 34.3, 34.4, 34.5, 34.6**

### Feedback and Continuous Improvement Properties

**Property 24: Structured Feedback Collection and Pattern Identification**

*For any* resolved complaint, the Notification_Service should collect structured feedback on categorization accuracy, routing appropriateness, and response timeliness; the Analytics_Engine should identify patterns when feedback indicates systematic issues and generate improvement recommendations.

**Validates: Requirements 35.1, 35.2, 35.3, 35.4, 35.5, 35.6**

## Error Handling

### Input Validation Errors

**Channel Interface**:
- Invalid message format: Return error in citizen's language
- Unsupported file type: Request supported format
- Image too large: Compress or request smaller image
- Rate limit exceeded: Inform citizen of throttling

**Language Processor**:
- Unsupported language: Request supported language or route to human operator
- Low transcription confidence (<0.80): Request citizen to repeat
- Translation failure: Route to human translator

**Image Verifier**:
- Image quality too low: Request clearer image
- Manipulation detected (authenticity <0.60): Flag for manual review
- Relevance too low (<0.70): Request additional context

### AI Processing Errors

**Complaint Processor**:
- Extraction failure: Request clarification from citizen
- Low categorization confidence (<0.75): Flag for human review
- Overall confidence <0.70: Queue for mandatory human review

**Duplicate Detector**:
- Similarity score 0.70-0.89: Flag for manual verification
- False positive detected: Accept unlinking request

**Severity Analyzer**:
- Bias detected (>20% regional deviation): Apply corrective multipliers
- Insufficient data: Use rule-based fallback

**Issue Router**:
- No matching department: Route to default coordination office
- Multiple rejections (≥2): Escalate to coordination authority
- Rejection loop (≥3): Trigger executive review

### System Failures

**Component Failures**:
- Language_Processor down: Accept complaints in fallback mode, route to human operators
- Duplicate_Detector down: Process without duplicate checking, inform departments
- Severity_Analyzer down: Use rule-based severity assignment
- Image_Verifier down: Accept images without verification

**Degradation Handling**:
- Log degradation period
- Display system status to citizens
- Alert administrators if degradation >4 hours
- Reprocess queued complaints upon recovery

### Operational Errors

**Department Non-Response**:
- No acknowledgment in 72 hours: Send automated reminder
- No acknowledgment in 7 days: Escalate to supervisor
- No acknowledgment in 14 days: Escalate to higher authority

**Resolution Disputes**:
- Citizen denies resolution: Reopen with escalated priority
- No citizen response in 14 days: Mark as unverified-resolved
- High unverified resolution rate: Flag department for audit

**Model Performance**:
- Accuracy drop >5%: Trigger drift alert
- Override rate >15%: Trigger retraining recommendation
- Distribution shift (KL divergence >0.3): Flag for evaluation

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests as complementary approaches:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Specific language detection examples (Hindi, Tamil, Bengali, etc.)
- Edge cases: empty complaints, malformed images, network failures
- Error conditions: unsupported languages, spam detection, manipulation detection
- Integration points: WhatsApp API, SMS Gateway, department systems

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random complaints in various languages and formats
- Test confidence scoring across wide input distributions
- Verify routing logic with randomized complaint characteristics
- Test bias detection with synthetic demographic variations
- Validate escalation logic with time-based simulations

### Property-Based Testing Configuration

**Framework**: Use fast-check (JavaScript/TypeScript), Hypothesis (Python), or QuickCheck (Haskell) depending on implementation language

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test references its design document property
- Tag format: `Feature: nagrik-connect, Property {number}: {property_text}`

**Example Property Test Structure**:
```typescript
// Feature: nagrik-connect, Property 1: Language Detection and Translation Accuracy
test('language detection accuracy across all supported languages', () => {
  fc.assert(
    fc.property(
      fc.record({
        text: fc.string(),
        language: fc.constantFrom('hi', 'ta', 'bn', 'te', 'mr', 'gu'),
      }),
      (input) => {
        const result = languageProcessor.detectLanguage(input.text);
        expect(result.confidence).toBeGreaterThan(0.85);
        expect(result.language).toBe(input.language);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

**Core Processing** (Properties 1-4):
- Unit tests: 10-15 tests per component
- Property tests: 1 test per property (4 total)

**Duplicate Detection** (Properties 5-6):
- Unit tests: 8-10 tests for edge cases
- Property tests: 2 tests

**Severity and Routing** (Properties 7-9):
- Unit tests: 15-20 tests for routing logic
- Property tests: 3 tests

**Status Tracking** (Properties 10-13):
- Unit tests: 12-15 tests for state transitions
- Property tests: 4 tests

**AI Reliability** (Properties 14-16):
- Unit tests: 10-12 tests for failure scenarios
- Property tests: 3 tests

**Bias Detection** (Properties 17-18):
- Unit tests: 8-10 tests for bias scenarios
- Property tests: 2 tests

**Security** (Properties 19-20):
- Unit tests: 10-12 tests for security scenarios
- Property tests: 2 tests

**Analytics** (Properties 21-23):
- Unit tests: 12-15 tests for metric calculations
- Property tests: 3 tests

**Feedback** (Property 24):
- Unit tests: 6-8 tests
- Property tests: 1 test

**Total**: ~100-120 unit tests, 24 property-based tests

### Integration Testing

**End-to-End Flows**:
1. Complaint submission → Processing → Routing → Resolution → Feedback
2. Duplicate detection → Linking → Synchronized status updates
3. Rejection loop → Escalation → Coordination authority
4. Non-response → Deadline escalation → Supervisor notification
5. AI failure → Fallback mode → Recovery → Reprocessing

**External System Integration**:
- WhatsApp Business API mock/sandbox
- SMS Gateway mock/sandbox
- Department system integration tests
- Analytics dashboard rendering tests

### Performance Testing

**Load Testing**:
- Complaint processing: Maintain <30 second processing time under high load
- Analytics queries: Complete within 5 seconds
- Concurrent complaint submission: Handle 1000+ simultaneous submissions

**Stress Testing**:
- AI component failures: Verify graceful degradation
- Database connection failures: Verify retry logic
- Network intermittency: Verify queue and retry mechanisms

### Security Testing

**Penetration Testing**:
- PII encryption validation
- SQL injection prevention
- API authentication and authorization
- Rate limiting effectiveness

**Privacy Testing**:
- Anonymization verification in public analytics
- Data deletion compliance
- Access logging completeness
