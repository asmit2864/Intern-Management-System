---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/prd.md', 'c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/architecture.md', 'c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/ux-design-specification.md']
---

# InternManagement - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for InternManagement, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

*   **FR1:** Hiring Manager can log in using Email/Password.
*   **FR2:** System enforces session timeouts for security (auto-logout).
*   **FR3:** Admin can reset user passwords.
*   **FR4:** Manager can drag-and-drop multiple PDF resumes at once.
*   **FR5:** System automatically extracts Name, Email, and Skills from PDFs.
*   **FR6:** Manager can resolve parsing errors manually if extraction fails.
*   **FR7:** Manager can view all candidates in a Sortable/Filterable List.
*   **FR8:** Manager can view candidate status (Shortlisted, Screening, In Progress, Selected, Offered, Joined, Rejected).
*   **FR9:** **(Mobile)** Manager can view a "Card View" of candidates optimized for mobile screens.
*   **FR10:** Manager can generate a PDF offer letter using a standard template.
*   **FR11:** Manager can preview the PDF before sending.
*   **FR12:** Manager can send the Offer Email with one click.
*   **FR13:** System prevents "Retracting" an offer once sent.
*   **FR14:** Manager can edit candidate details (Address, ID Proof) at any stage.
*   **FR15:** Manager can upload secure attachments (ID Proofs) to the candidate profile.
*   **FR16:** System encrypts sensitive PII (Passport/Pan Card) at rest.
*   **FR17:** Manager can log a global "Weekly Score" (1-10) for a joined intern.
*   **FR18:** Manager can add free-text notes to a weekly log.
*   **FR19:** System visualizes the score trend on the Candidate Profile.
*   **FR20:** System retries failed emails automatically (up to 3 times).
*   **FR21:** System logs all email failures for Admin review.

### NonFunctional Requirements

*   **NFR1 (Performance):** Dashboard pages must load in < 1 second.
*   **NFR2 (Performance):** PDF Offer Letters must generate in < 3 seconds.
*   **NFR3 (Performance):** Batch upload of 10 resumes must process in < 30 seconds.
*   **NFR4 (Security):** All Candidate ID Proofs (Passport/PAN) must be encrypted at rest (AES-256).
*   **NFR5 (Security):** Only the Hiring Manager and Admin IP addresses can access the backend.
*   **NFR6 (Security):** Generated PDF links sent via email must expire after 7 days.
*   **NFR7 (Reliability):** System must achieve 99% logic success rate (retries on SMTP failure).
*   **NFR8 (Reliability):** 99.5% Uptime during business hours (9 AM - 6 PM IST).
*   **NFR9 (Mobile Accessibility):** Critical Actions (Approve Offer, View Status) must function on mobile viewports (375px+).
*   **NFR10 (Mobile Accessibility):** All buttons must be minimum 44x44px for touch accuracy.

### Additional Requirements

**From Architecture:**
*   **Project Initialization:** Manual Monorepo setup (`/client` Vite+React, `/server` Express).
*   **Database:** MongoDB with Mongoose (snake_case naming).
*   **API:** RESTful API with kebab-case endpoints and Zod validation.
*   **Auth:** JWT via httpOnly Cookies.
*   **PDF Generation:** Server-side `pdfkit` recommended (gap resolution).
*   **File Storage:** Local uploads/MinIO for MVP.
*   **State Management:** TanStack Query for server state.

**From UX Design:**
*   **Design System:** Shadcn/UI (Tailwind CSS + Radix UI).
*   **Theme:** "Sapphire & Slate" (Blue-600 Primary, Teal-600 Success).
*   **Ingestion Experience:** "Magic Drop" drag-and-drop animation.
*   **Offer Experience:** "Click-to-Ship" with Split-screen preview.
*   **Mobile View:** Data Table transforms to Card Stack.

### FR Coverage Map

*   **FR1:** Epic 1 - Secure Access Foundation
*   **FR2:** Epic 1 - Secure Access Foundation
*   **FR3:** Epic 1 - Secure Access Foundation
*   **FR4:** Epic 2 - Intelligent Candidate Ingestion
*   **FR5:** Epic 2 - Intelligent Candidate Ingestion
*   **FR6:** Epic 2 - Intelligent Candidate Ingestion
*   **FR7:** Epic 3 - Hiring Command Center
*   **FR8:** Epic 3 - Hiring Command Center
*   **FR9:** Epic 3 - Hiring Command Center
*   **FR10:** Epic 4 - One-Click Offer Engine
*   **FR11:** Epic 4 - One-Click Offer Engine
*   **FR12:** Epic 4 - One-Click Offer Engine
*   **FR13:** Epic 4 - One-Click Offer Engine
*   **FR14:** Epic 3 - Hiring Command Center
*   **FR15:** Epic 3 - Hiring Command Center
*   **FR16:** Epic 5 - System Reliability & Security Shield
*   **FR17:** Epic 3 - Hiring Command Center
*   **FR18:** Epic 3 - Hiring Command Center
*   **FR19:** Epic 3 - Hiring Command Center
*   **FR20:** Epic 5 - System Reliability & Security Shield
*   **FR21:** Epic 5 - System Reliability & Security Shield

## Epic List

### Epic 1: Secure Access Foundation

**Goal:** Establish the secure perimeter so the Hiring Manager can access the command center.

### Story 1.0: Project Initialization

As a Developer,
I want to initialize the project structure (Client+Server),
So that development can begin on a solid foundation.

**Acceptance Criteria:**

**Given** an empty repository
**When** I run the validation commands
**Then** I should see a `/client` folder (React + Vite)
**And** I should see a `/server` folder (Express + Node)
**And** the client should have Tailwind CSS and Shadcn/UI configured
**And** the server should have a basic DB connection stub

### Story 1.1: Backend Auth Infrastructure

As a Developer,
I want to set up the User model and password hashing utilities,
So that user credentials can be stored securely.

**Acceptance Criteria:**

**Given** a MongoDB connection
**When** the User schema is defined
**Then** it should include email (unique), password (hashed), and role fields
**And** a utility to hash passwords using bcrypt should be available
**And** a utility to compare passwords should be available

### Story 1.2: Login API Implementation

As a Hiring Manager,
I want to log in via the API,
So that I can establish a secure session.

**Acceptance Criteria:**

**Given** a registered user exists
**When** I send a POST request to `/api/auth/login` with valid credentials
**Then** the system should return a 200 OK
**And** an httpOnly JWT cookie should be set
**And** the response body should contain non-sensitive user profile data

### Story 1.3: Frontend Login Screen

As a Hiring Manager,
I want a login page,
So that I can enter my credentials.

**Acceptance Criteria:**

**Given** I am on the `/login` page
**When** I enter a valid email and password and click "Sign In"
**Then** I should be redirected to the Dashboard
**And** invalid credentials should show an inline error message
**And** the page should use the "Sapphire & Slate" theme

### Story 1.4: Protected Route Logic

As a Security Administrator,
I want to prevent unauthorized access to the dashboard,
So that candidate data remains secure.

**Acceptance Criteria:**

**Given** I am an unauthenticated user
**When** I attempt to access `/dashboard`
**Then** I should be redirected to `/login`
**And** checking session status via API should return 401
**And** session timeout (token expiry) should auto-redirect to login

### Story 1.5: Admin Password Reset

As an Admin,
I want to reset a user's password,
So that they can regain access if locked out.

**Acceptance Criteria:**

**Given** I am a logged-in Admin
**When** I hit the password reset endpoint for a specific user ID
**Then** the password should be updated to a temporary value
**And** the user should be able to login with the new password

### Epic 2: Intelligent Candidate Ingestion

**Goal:** Transform raw PDF files into structured, actionable candidate data.

### Story 2.1: Resume Parsing Endpoint (Staging)

As a Developer,
I want an API endpoint to parse resumes without saving them to the database,
So that I can preview the data before committing it.

**Acceptance Criteria:**
**Given** the backend is running
**When** a POST request is sent to `/api/candidates/parse` (formerly upload)
**Then** the file should be parsed
**And** the structured data should be returned in the response
**And** the file should be temporarily stored (for later linking)
**But** NO candidate record should be created in the database yet

### Story 2.2: Real Resume Parser Service

As a Developer,
I want a service to parse PDF resumes,
So that candidate details are automatically extracted.

**Acceptance Criteria:**
**Given** a PDF file path
**When** the parser service processes it
**Then** it should extract Text content
**And** identify Name, Email, Phone, Skills, Education (Degree, Institute, Year, CGPA/%)
**And** extract Social Links (LinkedIn, GitHub) via Regex
**And** return a confidence score based on missing fields

### Story 2.3: Candidate Schema & Database

As a Developer,
I want a Mongoose schema to store candidate data,
So that I can persist resumes and tracking info.

**Acceptance Criteria:**
**Given** the database connection
**When** the schema is validated
**Then** it should support fields: Name, Email, Phone, Skills, Education, Experience, ResumeURL
**And** it should support **Social Links** (GitHub, LinkedIn)
**And** `status` should support: Shortlisted, Screening, In Progress, Selected, Offer, Onboarding, Ready to Join, Active, Rejected
**And** default status should be `Shortlisted`

### Story 2.4: Upload Progress & Staging Display

As a Hiring Manager,
I want to see the parsed data in a staging list,
So that I can verify candidates before adding them.

**Acceptance Criteria:**
**Given** files are uploaded and parsed
**Then** they should appear in a "Staged Candidates" list
**And** I should see their parsed status (Green/Red)
**But** they should NOT be in the main candidate list yet

### Story 2.5: Manual Resolver (Local Editing)

As a Hiring Manager,
I want to edit the parsed data in the staging area,
So that I can correct mistakes before saving.

**Acceptance Criteria:**
**Given** a staged candidate
**When** I click "Review" or "Resolve"
**Then** I can edit the name, email, skills locally
**And** saving updates the staging status to "Ready" (Visual feedback)

### Story 2.6: Batch Save Candidates

As a Hiring Manager,
I want to save all verified candidates at once,
So that I can commit the batch to the database.

**Acceptance Criteria:**
**Given** there are valid candidates in the staging area
**When** I click "Confirm Ingestion" or "Save All"
**Then** all valid candidates should be sent to the backend
**And** they should be saved to the database
**And** the staging area should clear

### Epic 3: Hiring Command Center (Dashboard)

**Goal:** Manage the intern pipeline and tracked data from "Shortlisted" to "Joined".

### Story 3.1: Candidate List API

As a Developer,
I want an endpoint to list candidates with filtering,
So that the dashboard can display the right data.

**Acceptance Criteria:**

**Given** the database has candidates
**When** I GET `/api/candidates`
**Then** I should receive a paginated list
**And** I should be able to filter by `status` (e.g. ?status=Shortlisted)
**And** the response should include basic profile info (Name, Email, Status, ParsingConfidence)

### Story 3.2: Dashboard Data Table

As a Hiring Manager,
I want to view candidates in a table,
So that I can see the pipeline at a glance.

**Acceptance Criteria:**
**Given** I am on the dashboard
**When** the page loads
**Then** I should see a table of candidates
**And** columns should match: Candidate, Applied Date (small font), Status, Education, **CGPA / %**
**And** clicking a row should open the Detail View
**And** table width should be optimized for large screens

### Story 3.3: Responsive Card View

As a Hiring Manager,
I want to view candidates as cards on mobile,
So that the information is readable on small screens.

**Acceptance Criteria:**

**Given** I am on a mobile device (<768px)
**When** I view the dashboard
**Then** the Data Table should be hidden
**And** a Stack of "Quick Review Cards" should be visible
**And** each card should show Name, Status Badge, and a "Review" action

### Story 3.4: Candidate Detail View

As a Hiring Manager,
I want to see full details of a candidate,
So that I can make hiring decisions.

**Acceptance Criteria:**
**Given** I click on a candidate
**When** the detail panel slides out
**Then** I should see all extracted data including **Social Links**
**And** Contact Info should be displayed as **Interactive Cards**
**And** I should see the link to their original Resume PDF

### Story 3.5: Edit Candidate Profile

As a Hiring Manager,
I want to edit candidate details,
So that I can correct mistakes o
r add info like "Joined Date".

**Acceptance Criteria:**

**Given** I am viewing a candidate
**When** I click "Edit" and change a field (e.g., Address)
**Then** the save action should persist the change to the database
**And** the UI should update immediately (Optimistic Update)

### Story 3.6: Status Workflow Logic

As a Hiring Manager,
I want to move candidates between stages,
So that I can track progress.

**Acceptance Criteria:**
**Given** a candidate is in any stage
**Then** it should support: Shortlisted -> Screening -> In Progress -> Selected -> Offer -> Active or Rejected
**And** **"Rejected"** status should have distinct Red styling
**And** failing any round should auto-update status to **"Rejected"**
**And** a manual **"Reject"** button should be available in the candidate header
**And** rejecting manually should prompt for a **"Rejection Reason"** (Predefined or Custom)
**And** the UI should update immediately (Optimistic UI)

### Story 3.7: Candidate Detail Tabs

As a Hiring Manager,
I want to view candidate details in organized tabs,
So that I can focus on one context at a time.

**Acceptance Criteria:**
**Given** I am on the Candidate Detail page
**Then** I should see 3 distinct tabs:
  1. **Resume Preview:** The original PDF.
  2. **Onboarding & Documents:** Full document history (always visible).
  3. **Internship Status:** Actions to start internship or view active status.


### Epic 9: Advanced Hiring Pipeline

**Goal:** Replace static status updates with a dynamic, round-based evaluation workflow.

### Story 9.1: Dynamic Round Management
As a Hiring Manager,
I want to add multiple evaluation rounds (Assessment, GD, Interview),
So that I can track the candidate's journey in detail.

**Acceptance Criteria:**
**Given** a candidate in progress
**When** I click "Add Round"
**Then** I can select the type (Assessment, GD, Technical, HR)
**And** I can enter a score/feedback
**And** the next interviewer can see this history

### Story 9.2: Strict State Guards
As a System,
I want to lock future stages until prerequisites are met,
So that process integrity is maintained.

**Acceptance Criteria:**
**Given** a candidate has not passed interviews
**Then** the "Send Offer" button should be disabled
**And** the "Onboarding" tab should be locked
**When** the candidate is marked "Selected"
**Then** the "Send Offer" button becomes active

### Story 9.3: Sequential Evaluation Enforcement
As a System,
I want to enforce strictly sequential round evaluations,
So that process integrity is ensured.

**Acceptance Criteria:**
**Given** multiple rounds in the pipeline (e.g., Round 1, Round 2)
**When** Round 1 is "Pending"
**Then** Round 2's "Evaluate" and "Review" actions should be **Locked**
**And** if Round 1 is marked "Failed", Round 2 should be visibly **Terminated** (Red Styling)

**Goal:** Eliminate manual letter creation with automated generation and delivery using the User's provided template.

### Story 4.1: Offer Template Digitization

As a Developer,
I want to convert the provided `offerLetter.pdf` into a dynamic HTML template,
So that I can programmatically replace the name, dates, and remove the hardcoded address.

**Acceptance Criteria:**

**Given** the reference file `letter/offerLetter.pdf`
**When** I create the HTML template
**Then** it should visually match the original PDF
**And** "Asmit Kumar" should be replaced with `{{candidateName}}` (and variants like First Name)
**And** "S/O: Rajveer Singh..." address block should be dynamic or removed
**And** The Header Date, Joining Date, and Signing Deadline should be dynamic variables (`{{offerDate}}`, `{{joiningDate}}`, `{{expiryDate}}`)
**And** Salary details should remain static as per the original

### Story 4.2: PDF Generation Service

As a Developer,
I want a service to generate PDFs from the HTML template,
So that I can create the final offer document.

**Acceptance Criteria:**

**Given** candidate data and specific dates
**When** the generation service is called
**Then** it should output a PDF buffer
**And** the PDF should contain the correctly merged data
**And** generation should take less than 3 seconds

### Story 4.3: Offer Customization & Preview UI

As a Hiring Manager,
I want to customize dates and preview the offer before sending,
So that I can verify accuracy.

**Acceptance Criteria:**

**Given** I click "Send Offer" on a candidate
**Then** a **Customization Popup** should open asking for:
  - Offer Date (Default: Today)
  - Joining Date
  - Last Date to Sign
**When** I confirm these details
**Then** a **Preview Modal** should open showing the generated PDF
**And** I should have two actions: "Edit Details" (Back) and "Send Offer" (Confirm)

### Story 4.4: Email Sending Service

As a Developer,
I want a robust email service,
So that offers are delivered reliably.

**Acceptance Criteria:**

**Given** an SMTP configuration
**When** the email service is invoked
**Then** it should send an HTML email with the PDF attachment
**And** the email text should prompt the user to reply with the signed copy
**And** it should log the success or failure

### Story 4.5: "Send Offer" Transaction & Feedback

As a Hiring Manager,
I want clear feedback after sending,
So that I know the action succeeded.

**Acceptance Criteria:**

**Given** I click "Send Offer" in the Preview
**When** the sending succeeds
**Then** the "Generate/Send Offer" button in the Candidate View should change to **"Sent"** (Grey, Disabled)
**And** the Candidate Status should automatically update to **"Offer"**
**And** the **Joining Date** selected should be saved to the candidate profile
**And** I should see a success message

### Epic 5: System Reliability & Security Shield

**Goal:** Guarantee data safety and communication reliability.

### Story 5.1: PII Encryption Service

As a Security Engineer,
I want sensitive data to be encrypted at rest,
So that candidate privacy is protected even if the DB is compromised.

**Acceptance Criteria:**

**Given** a candidate has ID Proofs or Passport data
**When** this data is saved to the database
**Then** it should be encrypted using AES-256
**And** it should be transparently decrypted when accessed by the API

### Story 5.2: Global Error Logging

As a Developer,
I want centralized error logging,
So that I can diagnose issues in production.

**Acceptance Criteria:**

**Given** an exception occurs in the backend
**When** the global error handler catches it
**Then** it should be logged with stack trace and context
**And** critical errors should be distinguishable from warnings

### Story 5.3: Email Failure & Retry Job

As a Hiring Manager,
I want failed emails to retry automatically,
So that transient network issues don't cause missed offers.

**Acceptance Criteria:**

**Given** an email fails to send (SMTP error)
**When** the failure is detected
**Then** the system should schedule a retry (exponential backoff)
**And** it should give up after 3 attempts
**And** final failure should alert the Admin

### Story 5.4: Admin System Dashboard

As an Admin,
I want a dashboard to view system health,
So that I can monitor email failures and errors.

**Acceptance Criteria:**

**Given** I am logged in as Admin
**When** I view the System Dashboard
**Then** I should see a list of recent Error Logs
**And** I should see a list of Failed Email Jobs
**And** I should be able to manually trigger a retry

### Story 5.5: Secure Headers & Rate Limiting

As a Security Engineer,
I want to harden the API against attacks,
So that the system remains stable and secure.

**Acceptance Criteria:**

**Given** the API is online
**When** requests are made
**Then** standard security headers (Helmet) should be present
**And** excessive requests from a single IP should be rate-limited
**And** CORS should be strictly configured for the trusted client domain

### Epic 6: AI-Native Hiring Assistant

**Goal:** Empower the Hiring Manager to conduct instant, conversational deep-dives into any candidate's background using LLM-driven insights.

#### Story 6.1: AI Insight Engine (Backend)
As a Developer, I want to create an API endpoint that communicates with an LLM, so that I can process hiring queries about candidates.

#### Story 6.2: Context-Aware Chat Interface (Frontend)
As a Hiring Manager, I want a chat interface next to the resume, so that I can ask specific questions about the candidate's experience.

#### Story 6.3: Ephemeral Intelligence (Persistence)
As a Developer, I want to manage chat context per session, so that the LLM remembers the candidate's details for the duration of the review session.

#### Story 6.4: The "Hiring Hardwalls" (Safety)
As a Security Officer, I want the bot to refuse non-hiring questions, so that the system remains focused and professional.

### Epic 7: Onboarding & Document Verification

**Goal:** Streamline the transition from "Offer Accepted" to "Ready to Join" through automated document collection and verification.

### Story 7.1: Enable Onboarding & User Creation
As a Hiring Manager,
I want to "Enable Onboarding" for a candidate,
So that they get a user account and access to the portal.

**Acceptance Criteria:**
**Given** a candidate has accepted the offer
**When** I click "Enable Onboarding"
**Then** a User account (Role: Intern) should be created
**And** an email should be sent with login credentials
**And** the candidate status should change to `Onboarding`

### Story 7.2: Candidate Document Upload
As an Intern,
I want to upload my joining documents (Aadhar, PAN, Degree),
So that I can verify my eligibility.

**Acceptance Criteria:**
**Given** I am logged in as an Intern
**When** I upload a file for a specific document type
**Then** the file should be saved safely
**And** the status for that document should be `Pending Verification`

### Story 7.3: Manager Document Verification
As a Hiring Manager,
I want to view and verify uploaded documents,
So that I can clear the candidate for joining.

**Acceptance Criteria:**
**Given** a candidate has uploaded docs
**When** I view the Onboarding tab
**Then** I can preview the file (PDF/Image)
**And** I can mark it as `Verified` or `Rejected` (with reason)
**And** if "Verified", the timestamp is recorded.

### Story 7.4: Self-Healing Status Logic
As a System,
I want to automatically update the candidate's status based on document compliance,
So that manual status updates are minimized.

**Acceptance Criteria:**
**Given** a candidate is in `Onboarding`
**When** ALL required documents are marked `Verified`
**Then** the candidate status should auto-update to `Ready to Join`
**But** if a document is later rejected, the status should revert to `Onboarding`
**Unless** the candidate is already `Active` (Active interns should NOT revert)

### Story 7.5: Request Document Re-upload
As a Manager,
I want to request a re-upload for a document that was previously verified,
So that I can correct audit mistakes.

**Acceptance Criteria:**
**Given** a verified document
**When** I click "Request Re-upload" (Re-verify)
**Then** I should be prompted for a reason
**And** the document status should change to `Rejected`
**And** the Intern should see an alert requesting re-upload

### Epic 8: Internship Management & Performance

**Goal:** Manage the active internship lifecycle including training, performance tracking, and mentorship.

### Story 8.1: Start Internship
As a Manager,
I want to officially start the internship for a candidate,
So that their timeline and performance tracking begins.

**Acceptance Criteria:**
**Given** a candidate is `Ready to Join`
**When** I click "Start Internship"
**Then** the status changes to `Active`
**And** the `internshipStartDate` is recorded
**And** a Jira Snapshot record is initialized

### Story 8.2: Weekly Performance Scorecard
As a Manager,
I want to submit a weekly score (**1-5 Stars**) and feedback,
So that the intern's progress is tracked.

**Acceptance Criteria:**
**Given** an Active intern
**When** I submit a review for the current week
**Then** the score and feedback are saved
**And** the intern can view the feedback in their portal

### Story 8.3: Training Board Visualization
As a User (Intern/Manager),
I want to view the training modules and progress,
So that I know what needs to be learned.

**Acceptance Criteria:**
**Given** I am on the Training tab
**Then** I should see a Kanban/List of training modules
**And** I can see the completion status of each

### Story 8.4: Dashboard Analytics & Jira Integration
As a Manager,
I want to see a holistic view of the intern's performance (Jira + Reviews),
So that I can assess their value.

**Acceptance Criteria:**
**Given** the Dashboard
**Then** I should see the "Velocity" (Active Tickets)
**And** I should see the "Last Review Score"
### Story 8.5: Remove Training Module
As a Manager,
I want to remove an assigned training module,
So that I can correct mistakes or update requirements.

**Acceptance Criteria:**
**Given** an assigned module
**When** I click the "Delete" icon and confirm
**Then** the module is removed from the list
**And** a notification is sent to the intern

### Story 8.6: Intern Notifications
As an Intern,
I want to be notified of critical updates,
So that I stay informed about changes to my tasks.

**Acceptance Criteria:**
**Given** a manager performs a critical action (e.g. Delete Training)
**When** I log in to my dashboard
**Then** I should see an Alert notification
**And** I can dismiss it after reading

### Story 8.7: Manager Custom Notifications
As a Manager,
I want to send a custom notification to an intern,
So that I can communicate important updates anonymously or formally.

**Acceptance Criteria:**
**Given** I am on the Intern Detail page
**When** I click "Send Notification"
**Then** a modal should appear asking for Title and Message
**And** sending it should immediately trigger a notification for the intern

### Story 8.8: Advanced Notification Badge
As a User,
I want to see the status of my notifications at a glance,
So that I know if I have new items or just history.

**Acceptance Criteria:**
**Given** I have notifications
**Then** the Bell Icon should show a **Red Dot** if there are Unread items
**And** it should show a **Yellow Dot** if all items are Read but present
**And** it should show **No Dot** if the list is empty
**And** visiting the Notifications page should auto-mark all as read (Red -> Yellow)
