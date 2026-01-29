---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-11-polish']
inputDocuments: ['c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/product-brief-InternManagement-2026-01-16.md', 'c:/Users/Wissen/Desktop/InternManagement/_bmad-output/analysis/brainstorming-session-2026-01-14.md']
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
classification:
  projectType: Web Application
  domain: HR / Recruitment
  complexity: Low
  projectContext: Greenfield
---

# Product Requirements Document - InternManagement

**Author:** Asmit
**Date:** 2026-01-16

## Executive Summary

**InternManagement** is a specialized "Hiring Command Center" designed to transform the chaotic, manual intern hiring process (Excel + Email) into a streamlined, automated workflow.

*   **Core Problem:** Hiring Managers waste days manually parsing resumes and drafting offer letters.
*   **Solution:** A single-user Web Application offering drag-and-drop resume parsing, status boards, and one-click offer automation.
*   **Key Differentiator:** **"Click-to-Offer" Workflow**—turning a 20-minute manual task into a 2-second automated action.

## Success Criteria

### User Success
*   **Zero Manual Entry:** Success is 100% reliance on the Resume Parser for candidate data.
*   **Relief from Hassle:** The Hiring Manager feels "relieved" rather than "anxious" when generating offers.
*   **One-Click Standard:** All key actions (Shortlist, Offer, Email) require only a single primary interaction.

### Business Success
*   **Process Efficiency:** Reduction of administrative overhead from days to minutes per cohort.
*   **Risk Mitigation:** 0% rate of "copy-paste" errors in official offer letters.
*   **Data Consistency:** 100% of intern data is captured in a structured format.

### Technical Success
*   **PDF Generation:** Offer letters generate in < 2 seconds.
*   **Email Deliverability:** 99.9% success rate for sent offers.
*   **Parsing Accuracy:** >90% accuracy on standard PDF resume formats.

### Measurable Outcomes
*   **Time-to-Offer:** < 2 minutes per candidate.
*   **Adoption Rate:** 100% of intern tracking occurs within the web platform (0% Excel usage).

## Product Scope & Roadmap

### MVP Strategy (Phase 1)
*   **Philosophy:** "Utility First" + "Anywhere Access".
*   **Launch Readiness:** Must be able to process the `Jan 2026` cohort end-to-end.
*   **Target Audience:** Single Hiring Manager (Power User on Desktop, Monitoring on Mobile).

### MVP Feature Set
*   **Smart Resume Parser:** Drag-and-drop PDF ingestion (Desktop priority).
*   **Recruitment Hub:** Status tracking (Fully Mobile Responsive).
*   **One-Click Offer Engine:** Generate/Send (Desktop) + View/Monitor (Mobile).
*   **Performance Light:** Scorecard input (Mobile optimized for quick entry).
*   **Mobile Accessibility:** Responsive design ensuring key actions work on phones.
*   **Data Management:** Full editability of candidate details (Pre/Post Joining).

### Phase 2: Onboarding (Implemented)
*   **Document Portal:** Interns upload Aadhar/PAN/Degree.
*   **Verification:** Manager verifies docs; system auto-updates status to "Ready to Join".

### Phase 2.5: AI-Native Assistant (Implemented)
*   **Gemini-Powered Chat:** Instant, context-aware queries about any candidate's resume (e.g., "Does he know React?").
*   **Smart Analysis:** Zero-latency insight extraction using the `gemini-3-flash` model.
*   **Privacy First:** Ephemeral sessions ensure no PII leakage to the model history.

### Phase 3: Internship (Implemented)
*   **Training Board:** Kanban view of learning modules.
*   **Performance:** Weekly scorecards and feedback loops.
*   **Jira Integration:** (Mocked) Velocity tracking on dashboard.

### Phase 2: Growth (Post-MVP)
*   **Student Portal:** Dedicated view for students to accept offers/view tasks.
*   **Multi-User Access:** Logic for Interviewers and Mentors to log in.
*   **Calendar Integration:** Auto-scheduling of intern reviews.

### Phase 3: Vision (Future)
*   **Full "Hiring Command Center":** Complete ecosystem management.
*   **HRIS Integration:** Sync successful hires to corporate systems.
*   **Alumni Network:** Track past interns for future full-time roles.

### Risk Mitigation
*   **Technical:** Polling strategy avoids WebSocket complexity; Mobile-first CSS framework ensures responsiveness.
*   **Market:** Quick MVP launch ensures validation of "Time Saving" hypothesis before building complex portals.
*   **Resource:** "Unified" architecture keeps codebase manageable for a small team.

## User Journeys

### 1. The "Happy Path": High-Velocity Hiring
*   **Persona:** Hiring Manager (Efficiency-Focused)
*   **Narrative:** It’s Friday 4 PM with 50 PDFs in the folder. The Manager drags them into the dashboard. System parses all 50 in seconds. Manager selects 5 top candidates, clicks "Generate Offers".
*   **Outcome:** 5 personalized PDF offers are generated and emailed instantly. Manager leaves for the weekend by 4:05 PM.
*   **Key Capabilities:** Bulk Upload, Smart Parsing, One-Click Automation.

### 2. The "Lifecycle Manager": Pre & Post-Joining Updates
*   **Persona:** Hiring Manager (Detail-Oriented)
*   **Narrative:** An intern, Rahul, accepts the offer but emails two weeks later saying his address changed and he has a new ID proof.
*   **Action:** Manager searches "Rahul", opens his profile (which is now in "Joined" status), and edits the "Address" and "ID Proof" fields.
*   **Outcome:** Data is updated silently without triggering new offers or alerts. The record is accurate for the final report.
*   **Key Capabilities:** Global Search, Editable Profile Fields (Pre/Post Joining), Data Persistence.

### 3. The "System Guardian": Support & Recovery
*   **Persona:** IT Support (Internal)
*   **Narrative:** The email server goes down during a batch send. The Manager panics.
*   **Action:** Support Logins to the "Recruitment Hub", sees the "Failed Email" logs, and clicks "Retry Failed Jobs" once the server is up.
*   **Outcome:** Emails are delivered delayed but successfully. Manager gets a "Success" notification.
*   **Key Capabilities:** Admin Dashboard, Error Logs, Retry Logic.

### Journey Requirements Summary
*   **Core:** Bulk Parsing, Template Engine, Email Automation.
*   **Data:** Full editability of candidate profile at ALL stages (Shortlisted, Offered, Joined).
*   **Constraint:** "Retract Offer" is **NOT** a supported action; once sent, it's final in the system.
*   **Rejection:** Candidates can be rejected manually via the dashboard or automatically if they fail any hiring round.

## Web Application Requirements

### Technical Stack
*   **Frontend:** React.js (SPA) for a responsive, interactive dashboard.
*   **Backend:** Node.js (REST API) for business logic and resume parsing control.
*   **Control Plane:** Decoupled architecture allowing independent scaling/updates.

### Architecture Decisions
*   **Data Sync:** **Polling** strategy. Dashboard updates on user action. No complex WebSocket overhead.
*   **Authentication:** **Simple Auth**. Standard Email/Password login (likely JWT-based).
*   **Browser Support:** Optimized for Desktop Chrome/Edge.

### Implementation Considerations
*   **API Design:** RESTful endpoints for Candidate CRUD and Action Triggers (e.g., `POST /api/offers/generate`).
*   **Responsive Design:** Fluid desktop layouts for data grids; functional mobile view for quick status checks.

## Functional Requirements

### 1. Authentication & Access
*   **FR1:** Hiring Manager can log in using Email/Password.
*   **FR2:** System enforces session timeouts for security (auto-logout).
*   **FR3:** Admin can reset user passwords.
*   **FR3.1:** **Role-Based Access Control (RBAC)** strictly separates Manager views (`/dashboard`) from Intern views (`/portal`).
*   **FR3.2:** **Intern Portal:** Specialized view for Interns to track Onboarding, Training, and Performance (`/portal`).

### 2. Candidate Ingestion (The Parser)
*   **FR4:** Manager can drag-and-drop multiple PDF resumes at once.
*   **FR5:** System automatically extracts Name, Email, and Skills from PDFs.
*   **FR6:** Manager can resolve parsing errors manually if extraction fails.
*   **FR6.1:** Manager can define a **Dynamic Hiring Pipeline** (Add rounds like Assessment, GD).
*   **FR6.2:** Manager can log feedback and scores for each round.
*   **FR6.3:** System automatically marks candidate as **"Rejected"** if any round is marked as **"Failed"**.
*   **FR6.4:** System enforces **State Guards** (e.g., Cannot send offer until selected).

### 3. Hiring Dashboard & Visibility
*   **FR7:** Manager can view all candidates in a Sortable/Filterable List.
*   **FR8:** Manager can view candidate status (Shortlisted, Screening, In Progress, Selected, Offered, Joined, Rejected).
*   **FR9:** **(Mobile)** Manager can view a "Card View" of candidates optimized for mobile screens.

### 4. Offer Management
*   **FR10:** Manager can generate a PDF offer letter using a standard template.
*   **FR11:** Manager can preview the PDF before sending.
*   **FR12:** Manager can send the Offer Email with one click.
*   **FR13:** System prevents "Retracting" an offer once sent.

### 5. Candidate Lifecycle Data
*   **FR14:** Manager can edit candidate details (Address, ID Proof) at any stage.
*   **FR15:** Manager can upload secure attachments (ID Proofs) to the candidate profile.
*   **FR16:** System encrypts sensitive PII (Passport/Pan Card) at rest.

6. Performance Tracking (Internship Phase)
*   **FR17:** Manager can log a global "Weekly Score" (**1-5 Star Rating**) for a joined intern.
*   **FR18:** Manager can add free-text notes to a weekly log.
*   **FR19:** System visualizes the score trend on the Candidate Profile.
*   **FR22:** Manager can view "Jira Velocity" (Mocked Data) alongside performance scores.
*   **FR26:** Manager can remove assigned training modules.
*   **FR27:** Interns receive in-app notifications for critical updates (e.g. Training Removed).
*   **FR28:** Manager can send "Custom Notifications" (Title + Message) to interns.
*   **FR29:** Intern Portal displays a "3-State Badge" (Red=Unread, Yellow=History, None=Empty) on the bell icon.

### 8. Onboarding & Verification
*   **FR23:** Intern can upload documents (Aadhar, PAN, Degree).
*   **FR24:** Manager can Verify/Reject documents.
*   **FR25:** System automatically moves Candidate to "Ready to Join" when all docs are verified.
*   **FR30:** Manager can request re-upload for already verified documents (Corner Case).

### 7. System Reliability
*   **FR20:** System retries failed emails automatically (up to 3 times).
*   **FR21:** System logs all email failures for Admin review (in Recruitment Hub).

## Non-Functional Requirements

### Performance
*   **Response Time:** Dashboard pages must load in < 1 second.
*   **Generation Speed:** PDF Offer Letters must generate in < 3 seconds.
*   **Parsing Speed:** Batch upload of 10 resumes must process in < 30 seconds.

### Security (PII Protection)
*   **Data Encryption:** All Candidate ID Proofs (Passport/PAN) must be encrypted at rest (AES-256).
*   **Access Control:** Only the Hiring Manager and Admin IP addresses can access the backend.
*   **Least Privilege:** Generated PDF links sent via email must expire after 7 days.

### Reliability
*   **Email Delivery:** System must achieve 99% logic success rate (retries on SMTP failure).
*   **Availability:** 99.5% Uptime during business hours (9 AM - 6 PM IST).

### Mobile Accessibility
*   **Responsiveness:** Critical Actions (Approve Offer, View Status) must function on mobile viewports (375px+).
*   **Touch Targets:** All buttons must be minimum 44x44px for touch accuracy.
