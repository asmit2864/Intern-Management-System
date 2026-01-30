---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/product-brief-InternManagement-2026-01-16.md', 'c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/prd.md', 'c:/Users/Wissen/Desktop/InternManagement/_bmad-output/planning-artifacts/ux-design-specification.md']
workflowType: 'architecture'
project_name: 'InternManagement'
user_name: 'Asmit'
date: '2026-01-16'
lastStep: 8
status: 'complete'
completedAt: '2026-01-16'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview
**Functional Requirements:**
*   **Data Ingestion:** High-fidelity parsing of resume files (PDF/DOCX) into structured candidate profiles.
*   **Workflow Management:** Kanban-style or List-style state management for candidates (Shortlisted -> Offer).
*   **Output Generation:** PDF generation for Offer Letters based on templates.

**Non-Functional Requirements:**
*   **Performance:** <500ms latency for key actions (Parsing feedback, Offer generation preview).
*   **Security:** PII protection for candidate data.
*   **Usability:** "Zero-Typing" goal implies heavy reliance on automated extraction and smart defaults.

### Scale & Complexity
*   **Primary Domain:** Full-Stack Web Application (SPA + API).
*   **Complexity Level:** Medium (Rich Frontend interactions, Standard CRUD Backend + File Processing).
*   **Estimated Components:** Frontend Dashboard, API Layer, Database, File Storage, Parsing Service.

### Technical Constraints & Dependencies
*   **Greenfield:** No legacy code to maintain.
*   **Stack Preference:** Modern web stack (implied React/Node based on UX specs).
*   **Browser Support:** Modern browsers (Chrome/Edge/Safari).

## Starter Template Evaluation

### Primary Technology Domain
**Full-Stack Web Application (MERN)**.
Shifted from T3/Next.js to a clear Client/Server separation for maximum control and simplicity.

### Starter Options Considered
1.  **apicgg/vite-mern-template:** Good feature set but potentially opinionated directory structure.
2.  **T3 Stack:** Rejected due to tight coupling and "Next.js-only" mental model.
3.  **Manual Monorepo Setup:** Cleanest approach. `/client` (Vite) + `/server` (Express).

### Selected Architecture: Clean MERN Monorepo

**Rationale for Selection:**
*   **Separation of Concerns:** Clear boundary between the React SPA (Client) and the Node API (Server).
*   **Simplicity:** No "meta-framework" magic (like Next.js Server Components) to debug. Standard REST API.
*   **Flexibility:** Can easily swap the backend for Go/Python later if needed without rewriting the frontend.

**Initialization Strategy:**
We will scaffold the project manually to ensure a clean slate:
1.  **Client:** `npm create vite@latest client -- --template react`
2.  **Server:** `npm init -y` (inside `/server` folder) with `express`, `mongoose`, `cors`.
3.  **Database:** MongoDB (Common Mongoose patterns).
4.  **Styling:** Tailwind CSS + Shadcn/UI initialized in `/client`.

**Architectural Decisions Provided by Strategy:**

**Language & Runtime:**
*   **Frontend:** JavaScript (React).
*   **Backend:** JavaScript (Node.js/Express).

**Styling Solution:**
*   **Tailwind CSS:** Utility-first styling.
*   **Shadcn/UI:** Component library installed directly into `/client/src/components`.

**Build Tooling:**
*   **Vite:** Extremely fast HMR and build for the React app.
*   **Nodemon:** For automatic backend development restarts.

## Core Architectural Decisions

### Data Architecture
*   **Database:** MongoDB (v7.0+).
*   **Schema Enforcement:** Mongoose.
*   **File Storage:** Binary data (PDFs) will be stored in `GridFS` (if self-hosted) or AWS S3 (compatible). *Decision: Start with S3-compatible local storage (MinIO) or just filesystem for MVP to keep costs zero.*
*   **New Models:**
    *   `CandidateDocument`: Tracks upload status and verification.
    *   `PerformanceReview`: Weekly scores (**1-5 Stars**) and feedback.
    *   `JiraSnapshot`: Caches Jira metrics (Active Tickets) for dashboard performance.
    *   `Notification`: Stores system alerts, `title`, `message`, `isRead` status.
    *   `Notification`: Stores system alerts, `title`, `message`, `isRead` status.
    *   (Update) `Candidate`: Add `rounds` array (storing evaluation history, scores, and status) and `rejectionReason` (mandatory string when status is 'Rejected').

    ### AI Integration (New)
    *   **Provider:** Google Gemini API (`@google/generative-ai`).
    *   **Model:** `gemini-3-flash-preview` (Optimized for speed/cost).
    *   **Context Strategy:** Raw Resume Text Injection (Truncated to ~10k chars).
    *   **Persistence:** Ephemeral Chat (Session-based, not stored in DB) to minimize PII risk.

### Authentication & Security
*   **Auth:** JWT via `httpOnly` Cookies.
*   **Passwords:** Bcrypt hashing (Salt rounds: 10).
*   **Validation:** `Zod` on both Client (Forms) and Server (API inputs).

### API & Communication
*   **Pattern:** RESTful API.
*   **Documentation:** Swagger/OpenAPI (via `swagger-jsdoc`) auto-generated from Routes.
*   **Endpoints:**
    *   `POST /upload/resume` (Multipart)
    *   `GET /candidates` (Filtering/Pagination)
    *   `PATCH /candidates/:id/status` (Workflow moves/Evaluations)
    *   `POST /candidates/:id/reject` (Manual rejection with reasoning)
    *   `POST /candidates/:id/evaluate` (Add evaluation round result)
    *   `GET /notifications` (User Alerts)
    *   `POST /notifications/custom` (Manager Send)
    *   `PUT /notifications/read-all` (Mark Read)
    *   `DELETE /notifications/:id` (Dismiss)
*   **Uploads:** `Multer` for streaming file uploads.

### Frontend Architecture
*   **State:** TanStack Query (Server State) + React Context (UI State).
*   **Routing:** React Router v6 (Data Routers).
    *   `/dashboard`: Private Manager Route.
    *   `/portal`: Private Intern Route.
    *   `/login`: Public Route.
*   **HTTP Client:** Axios (Interceptors for global error handling).

### Decision Impact & Implementation Sequence
1.  **Project Scaffold:** Manual Monorepo setup (`/client` + `/server`).
2.  **Backend Core:** Auth middleware, DB connection, Zod validation pipes.
3.  **Ingestion Feature:** Resume upload endpoint + Parsing stub.
4.  **Dashboard UI:** Candidate Data Table with TanStack Query integration.
5.  **Offer Feature:** Pdf generation logic.

## Implementation Patterns & Consistency Rules

### Naming Patterns
*   **Database (MongoDB):** `snake_case` for collection names (`job_applications`) and fields (`created_at`).
*   **API (REST):** `kebab-case` for endpoints (`/api/job-applications`). `camelCase` for JSON request/response bodies.
*   **Files:**
    *   React Components: `PascalCase.jsx`
    *   Utilities/Hooks: `camelCase.js`
*   **Variables:** `camelCase`, booleans must start with verb (`isActive`, `hasError`).

### API Response Standard
All API endpoints must return this structure:
```json
{
  "success": boolean,
  "data": any | null,
  "error": { "code": string, "message": string } | null,
  "meta": { "page": number, "limit": number, "total": number } | null
}
```

### Process Patterns
*   **Error Handling:**
    *   **Backend:** Global Error Middleware must catch all exceptions. Never `res.status(500)` manually in controllers.
    *   **Frontend:** `Axios Interceptor` detects 401 (Logout) and 500 (Toast "System Error").
*   **Validation:**
    *   **Backend:** `Zod` middleware validates `req.body` BEFORE controller.
    *   **Frontend:** `React Hook Form` + `zodResolver` for all inputs.
*   **State Management:**
    *   **Server State:** ALWAYS use `useQuery` / `useMutation`. never store API data in `useState` unless modifying it (forms).
    *   **Loading:** Use `isLoading` from React Query. Do not create manual `const [loading, setLoading]` flags.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
intern-management/
├── package.json (Workspaces or Scripts only)
├── .gitignore
├── README.md
├── docker-compose.yml (DB + local dev)
├── client/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   └── ui/ (Shadcn components)
│   │   ├── features/ (Domain Logic & State)
│   │   │   ├── candidates/
│   │   │   └── offers/
│   │   ├── lib/ (Axios, Constants, Utils)
│   │   └── hooks/
│   └── public/
└── server/
    ├── package.json
    ├── src/
    │   ├── app.js (Express App configuration)
    │   ├── server.js (Entry Point)
    │   ├── config/ (Env vars, DB connection)
    │   ├── middleware/ (Auth, Logging, Error Handling)
    │   └── modules/ (Feature Clusters)
    │       ├── candidates/
    │       │   ├── candidate.controller.js
    │       │   ├── candidate.service.js
    │       │   ├── candidate.model.js
    │       ├── boarding/
    │       │   ├── boarding.controller.js
    │       │   └── candidate-document.model.js
    │       ├── performance/
    │       │   ├── performance.controller.js
    │       │   ├── performance.model.js
    │       │   └── jira-snapshot.model.js
    │       └── auth/
    └── uploads/ (Temp storage for incoming files)
```

### Architectural Boundaries
*   **API Boundary:** The `/server` exposes REST endpoints consumed by `/client/src/lib/api.js`.
*   **Data Boundary:** Only `/server` connects to MongoDB. Client never touches DB directly.
*   **Code Sharing:** Logic is kept distinct. No shared types needed since we are using JavaScript.

### Feature Mapping
*   **Ingestion:** `client/src/features/candidates/IngestionDropzone.jsx` -> `server/src/modules/candidates/candidate.controller.js` (upload)
*   **Hiring Timeline:** `client/src/components/hiring/HiringTimeline.jsx` (Orchestrator)
    - `PipelineVisualizer`: Horizontal scrolling track.
    - `EvaluationList`: Vertical feedback cards.
*   **Onboarding:** `server/src/modules/boarding` (Doc Verification) -> `client/src/features/intern/DocumentUpload.jsx`
*   **Performance:** `server/src/modules/performance` (Reviews + Jira Mock) -> `client/src/features/manager/PerformancePage.jsx`
*   **Authentication:** `server/src/modules/auth` (Middleware + Routes) -> `client/src/hooks/useAuth.js`

## Architecture Validation Results

### Coherence Validation ✅
*   **Compatibility:** Vite (Client) and Express (Server) are the industry standard pair. No conflicts.
*   **Structure:** The `client`/`server` split physically enforces the API boundary defined in our patterns.

### Requirements Coverage
*   **Ingestion:** Covered by `/server/uploads` and `Multer`.
*   **Real-time status:** Covered by Client-side Polling (React Query).

### Gap Analysis
### Gap Analysis
*   **PDF Engine:** Decided. **Server-side `pdfkit`** implemented for high-fidelity control over the Offer Letter template.
*   **AI Engine:** Decided. **Google Gemini Flash** for cost-effective, high-speed resume analysis.

### Architecture Readiness
**Status:** GREEN.
**Confidence:** High.

### Architecture Completeness Checklist
**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped

**Overall Status:** READY FOR IMPLEMENTATION

## Architecture Completion Summary

### Final Architecture Deliverables
*   **Complete Architecture Document:** `{planning_artifacts}/architecture.md`
*   **Validated Structure:** Clean MERN Monorepo (`/client` + `/server`).
*   **Implementation Patterns:** "Trust Architecture" strict patterns defined.
*   **Status:** **READY FOR IMPLEMENTATION** ✅

### Implementation Handoff
**Next Step Suggestion:**
1.  **Project Initialization:** Run the scaffold commands.
    *   `npm create vite@latest client`
    *   `mkdir server && npm init -y`
2.  **Epic Creation:** Break down the "Ingestion" and "Offer" features into stories.

**Architecture Status:** **COMPLETE**.
