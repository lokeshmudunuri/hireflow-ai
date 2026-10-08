# HireFlow — Applicant Screening & Interview Management Platform

> A production-ready, full-stack recruitment operations and applicant tracking system (ATS) engineered with modern React 18, Vite, Node.js, Express, Sequelize ORM, and SQLite/MySQL.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-46%20passed-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-informational.svg)]()

---

## 📌 1. HireFlow Overview

**HireFlow** is a modern, enterprise-grade Applicant Tracking System (ATS) built to organize, streamline, and audit technical hiring operations. It coordinates talent acquisition across three primary personas: **Recruiters**, **Interviewers**, and **Administrators**.

Unlike traditional recruitment spreadsheets or opaque "black-box AI" tools that introduce non-compliant biases and hallucinations into hiring decisions, HireFlow provides:
- **Transparent, mathematical candidate evaluation** using a deterministic 100-point scoring algorithm.
- **Strict, state-machine governed application progression** across 9 lifecycle stages with an immutable audit log.
- **Standardized 5-competency interview scorecards** that bring consistency to panel evaluations.
- **Zero-configuration local setup** using a resilient SQLite fallback that works immediately out of the box without requiring external cloud accounts or paid third-party APIs.

---

## 🎯 2. Problem & Solution

### The Challenges in Modern Technical Hiring
1. **Subjective & Biased Screening:** Candidate review is often inconsistent between different team members, resulting in missed talent or biased shortlisting.
2. **Fragmented Pipelines:** Applications get lost between inbound submissions, manual resume screening, calendar invitations, and feedback consolidation.
3. **Unstructured Panel Feedback:** Interviewers take notes across disparate Slack threads, emails, and shared docs with no standardized grading rubric or quantitative recommendations.
4. **Audit & Compliance Gaps:** Lack of immutable audit trails makes it impossible to verify why a candidate was advanced, rejected, or placed on hold.

### The HireFlow Solution
1. **Deterministic 100-Point Scoring Engine:** Transparent, rule-based algorithm that calculates verifiable match ratings across skills, verified experience, portfolio projects, and education credentials.
2. **State-Machine Governed Kanban Funnel:** Enforces legal stage transitions across 9 distinct stages (`APPLIED` → `SCREENING` → `VALIDATED` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `INTERVIEW_COMPLETED` → `SELECTED` / `REJECTED` / `HOLD`) with immutable status history records.
3. **Role-Tailored Workspaces (RBAC):** Tailored operational views for Recruiters, Interviewers, and Admins so team members only access capabilities relevant to their function.
4. **Structured Interview Scorecards:** 5-competency rubric (Technical Depth, Problem Solving, Communication, System Architecture, Collaboration) with numeric ratings and formal hiring recommendations.

---

## ✨ 3. Key Features

- **Recruitment Operations Dashboard:**
  - Real-time KPIs: Total Applications, In Screening, Shortlisted, Active Interviews, Selected, and Rejected.
  - Visual funnel progression bar highlighting conversion across stages.
  - Candidate match score distribution histogram (Deterministic 100-Pt scale).
  - Upcoming interview round schedule with quick links to virtual rooms.
  - Recent candidate applications intake table.

- **9-Stage Kanban Pipeline:**
  - Complete 9-column interactive board (`APPLIED`, `SCREENING`, `VALIDATED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `INTERVIEW_COMPLETED`, `SELECTED`, `REJECTED`, `HOLD`).
  - Dual view modes: Kanban drag/status cards and tabular Data Table.
  - Multi-criteria filtering by search query, job requisition, stage, score range (80+, 60-79, <60), and minimum experience.
  - Multi-select bulk transitions with state-machine safety checks.

- **Candidate Dossier & Talent Pool:**
  - Comprehensive applicant profile containing verified experience, headline, contact information, education, and links (LinkedIn, GitHub, Portfolio).
  - Tabbed dossier inspector: Overview & Score breakdown, Validated Skills Inventory, Parsed Resume viewer, Portfolio & Production Projects, Screening Checklist Audit Log, Interview History, and Status Timeline with private recruiter notes.
  - Real-time score recalculation on demand.

- **Job Requisitions Management:**
  - Requisitions configured with department, location, employment type, salary bands, hiring managers, required screening criteria skills, and optional skills.
  - Lifecycle management: create, view, close, and reopen requisitions.
  - Direct candidate count per requisition.

- **Interviewer Workspace & Competency Scorecards:**
  - Specialized view for panel members: "My Interviews", "Today", "Upcoming", and "Completed".
  - Structured scorecard evaluating 5 core competencies on a 1–5 scale (Technical Knowledge, Problem Solving, Communication, System Architecture, and Team Collaboration).
  - Recommendation choices: *Strong Hire*, *Hire*, *Hold*, *No Hire*, *Strong No Hire* with required qualitative justification.

- **Team & Security Administration:**
  - User account management for administrators.
  - Real-time role reassignment (`admin`, `recruiter`, `interviewer`).
  - Account lifecycle toggling (Activate / Deactivate) with session invalidation protection.

- **Operational Notifications & Feedback:**
  - Live activity notification panel with unread badge indicators.
  - Toast notification system with custom variants (success, error, warning, info).
  - Accessible confirmation modals for destructive or state-changing actions.
  - Skeleton loaders and responsive empty states with retry triggers.

---

## 👥 4. User Roles & Permissions

HireFlow enforces strict Role-Based Access Control (RBAC) both in backend middleware (`roleMiddleware.js`) and in frontend route guards and UI components:

| Capability / Resource | Administrator (`admin`) | Lead Recruiter (`recruiter`) | Panel Interviewer (`interviewer`) |
| :--- | :---: | :---: | :---: |
| **Recruitment Operations Dashboard** (`/`) | ✅ Full Access | ✅ Full Access | ❌ Redirected to `/interviews` |
| **9-Stage Kanban Pipeline** (`/pipeline`) | ✅ Full Access | ✅ Full Access | ❌ Restricted |
| **Job Requisitions Management** (`/jobs`) | ✅ Create / Close / Reopen | ✅ Create / Close / Reopen | ❌ View Only |
| **Candidate Dossiers** (`/candidates`) | ✅ Full Access | ✅ Full Access | ✅ Read-Only Dossiers |
| **Screening Checklist Verification** | ✅ Allowed | ✅ Allowed | ❌ Forbidden |
| **Schedule Interview Rounds** | ✅ Allowed | ✅ Allowed | ❌ View Assigned Only |
| **Submit Evaluation Scorecards** (`/interviews`) | ✅ Allowed | ✅ Allowed | ✅ Assigned Rounds |
| **Team & Security Admin** (`/team`) | ✅ Full Lifecycle | ❌ Forbidden (403) | ❌ Forbidden (403) |
| **Change User Roles / Status** | ✅ Allowed | ❌ Forbidden (403) | ❌ Forbidden (403) |

---

## 🛠️ 5. Technology Stack

### Frontend Architecture
- **Framework:** React 18 (`react`, `react-dom`)
- **Build Tooling:** Vite 5 (fast HMR, optimized production bundling)
- **Routing:** React Router DOM v6
- **Styling:** Modular Vanilla CSS design system (`index.css`) featuring custom CSS variables, accessible dark theme, micro-animations, glassmorphic headers, and responsive layouts
- **Icons:** Lucide React (`lucide-react`)
- **HTTP Client:** Axios with JWT bearer token request and response interceptors

### Backend Architecture
- **Runtime:** Node.js (v18+ LTS)
- **Web Framework:** Express.js 4
- **ORM:** Sequelize 6
- **Database Engine:** SQLite 3 (zero-config local default) & MySQL 2 (production option)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) with 7-day configurable expiration
- **Password Security:** bcryptjs (10 salt rounds)
- **Validation:** express-validator
- **Logging:** Morgan
- **Testing:** Jest 29 & Supertest 7

---

## 🏗️ 6. System Architecture

### Architectural Overview

```
                          ┌──────────────────────────────┐
                          │   Client Browser (SPA)       │
                          │   React 18 + Vite + Router   │
                          └──────────────┬───────────────┘
                                         │
                             HTTP / REST (JSON API)
                             Authorization: Bearer <JWT>
                                         ▼
                          ┌──────────────────────────────┐
                          │     Express 4 Web Server     │
                          │   Port 5000 / CORS Enabled   │
                          └──────────────┬───────────────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
   ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
   │  Middlewares  │             │  Controllers  │             │ Core Services │
   │ - authJwt     │             │ - Auth        │             │ - Scoring (100)│
   │ - roleGuard   │             │ - Application │             │ - StateMachine│
   │ - validator   │             │ - Job / User  │             │ - Evaluation  │
   │ - errorHandle │             │ - Interview   │             │ - Dashboard   │
   └───────────────┘             └───────┬───────┘             └───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │        Sequelize ORM         │
                          │   Models, Hooks, Relations   │
                          └──────────────┬───────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
         ┌───────────────────┐                       ┌───────────────────┐
         │ SQLite (Default)  │                       │   MySQL Server    │
         │ hireflow_dev.sqlite│                      │  (Production Opt) │
         └───────────────────┘                       └───────────────────┘
```

---

## 📁 7. Project Structure

```
Hire flow/
├── .gitignore                     # Git exclusions (node_modules, .env, DBs, build)
├── package.json                   # Root orchestrator scripts (install, test, build)
├── README.md                      # Comprehensive project documentation
├── docs/                          # Architecture, scoring, and workflow specifications
│   ├── ARCHITECTURE.md
│   ├── SCORING_ALGORITHM.md
│   ├── SETUP.md
│   └── WORKFLOW_AND_RBAC.md
├── backend/
│   ├── .env                       # Local environment variables (SQLite default)
│   ├── .env.example               # Template environment configuration
│   ├── .gitignore                 # Backend-specific git ignore
│   ├── package.json               # Backend dependencies & scripts
│   ├── src/
│   │   ├── app.js                 # Express application & route assembly
│   │   ├── server.js              # Server entry point & DB sync
│   │   ├── config/
│   │   │   └── database.js        # Sequelize config with SQLite fallback
│   │   ├── controllers/           # HTTP handlers (auth, app, job, cand, etc.)
│   │   ├── middleware/            # Auth, RBAC, validator, errorHandler
│   │   ├── models/                # 14 Sequelize relational models
│   │   ├── routes/                # Express router definitions
│   │   ├── scripts/
│   │   │   ├── migrate.js         # Schema migration runner
│   │   │   └── seed.js            # Realistic ATS seeder (candidates, jobs, users)
│   │   └── services/              # Scoring, state machine, interview services
│   └── tests/
│       ├── api.test.js            # 27 comprehensive integration tests
│       ├── full_flow.test.js      # 19 end-to-end recruitment lifecycle tests
│       └── verify_live.js         # Live HTTP verification script
└── frontend/
    ├── .env.example               # Frontend environment template
    ├── .gitignore                 # Frontend-specific git ignore
    ├── index.html                 # HTML shell
    ├── package.json               # Frontend dependencies & scripts
    ├── vite.config.js             # Vite configuration with API reverse proxy
    └── src/
        ├── App.jsx                # Application layout & route guards
        ├── main.jsx               # React DOM root entry
        ├── index.css              # Custom design system styles & animations
        ├── api/
        │   └── client.js          # Axios client & typed service methods
        ├── context/
        │   ├── AuthContext.jsx    # Session management & role switcher
        │   └── ToastContext.jsx   # Global toast notifications
        ├── components/            # Reusable UI components & modals
        │   ├── CandidateDetailModal.jsx
        │   ├── ConfirmModal.jsx
        │   ├── EmptyState.jsx
        │   ├── EvaluationModal.jsx
        │   ├── ScheduleInterviewModal.jsx
        │   ├── ScoreCard.jsx
        │   ├── Sidebar.jsx
        │   ├── SkeletonLoader.jsx
        │   ├── TopBar.jsx
        │   └── ValidationModal.jsx
        └── pages/                 # Role-aware page views
            ├── CandidatesPage.jsx
            ├── DashboardPage.jsx
            ├── InterviewsPage.jsx
            ├── JobsPage.jsx
            ├── LoginPage.jsx
            ├── NotFoundPage.jsx
            ├── PipelinePage.jsx
            └── TeamPage.jsx
```

---

## ⚡ 8. Installation & Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git**

### Step 1: Clone the Target Repository
```bash
git clone https://github.com/lokeshmudunuri/hireflow-ai.git
cd hireflow-ai
```

### Step 2: Install All Dependencies
From the root directory, install dependencies for root, backend, and frontend with a single command:
```bash
npm run install:all
```
*(Alternatively: run `npm install` in the root, `backend`, and `frontend` directories).*

---

## ⚙️ 9. Environment Variables

The project includes pre-configured `.env` and `.env.example` files. No paid APIs or external third-party services are required.

### Backend (`backend/.env`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=hireflow_super_secure_jwt_secret_key_2026_production
JWT_EXPIRES_IN=7d

# Database Configuration (Default: SQLite local zero-config fallback)
DB_DIALECT=sqlite
SQLITE_STORAGE=./hireflow_dev.sqlite

# MySQL Option (if running a local MySQL service):
# DB_DIALECT=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_NAME=hireflow
# DB_USER=root
# DB_PASSWORD=

# Client Configuration
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env.example`):
```env
# Proxy forwards /api requests to http://localhost:5000 automatically
VITE_API_URL=/api
```

---

## 💾 10. Database Setup & Seeding

HireFlow operates with SQLite by default, creating `hireflow_dev.sqlite` locally upon first run. If MySQL is configured in `.env`, the system automatically connects to MySQL or falls back gracefully to SQLite if the MySQL daemon is unavailable.

### Run Database Synchronization & Seed
```bash
# Synchronize database tables
npm run migrate

# Seed realistic recruitment data
npm run seed
```

The seeder populates:
- **5 User Accounts:** System Admin, Lead Technical Recruiter, Senior Talent Partner, Staff Software Engineer (Interviewer), Principal DevOps Architect (Interviewer).
- **6 Job Requisitions:** Full Stack Engineer, Frontend Platform Architect, DevOps/SRE, Backend Microservices Engineer, Staff Distributed Systems Architect, and Lead Product Designer.
- **12 Realistic Candidates:** Complete profiles with Indian and global tech backgrounds (ex-Swiggy, ex-Razorpay, ex-PhonePe, ex-Flipkart, ex-CRED, ex-Postman, ex-Stripe), verified GitHub/portfolio links, education, parsed resumes, and projects.
- **12 Applications across 9 Stages:** Fully populated deterministic score breakdowns, screening verification checklists, and audit histories.
- **Scheduled & Completed Interviews:** Pre-seeded rounds with virtual room links and completed 5-competency evaluation scorecards.
- **Operational Activity Notifications:** Pre-seeded alerts for recruiter and interviewer feeds.

---

## 💻 11. Development Commands

| Command | Working Directory | Description |
| :--- | :--- | :--- |
| `npm run install:all` | Root | Installs dependencies across root, backend, and frontend |
| `npm run backend` | Root | Starts backend API server with nodemon (`http://localhost:5000`) |
| `npm run frontend` | Root | Starts Vite frontend dev server (`http://localhost:5173`) |
| `npm run build` | Root | Builds frontend production bundle to `frontend/dist` |
| `npm run migrate` | Root | Syncs Sequelize database schema |
| `npm run seed` | Root | Resets and seeds realistic ATS data |
| `npm run test` | Root | Runs complete Jest automated test suite |

---

## 📡 12. API Overview

### Health & Core
- `GET /api/health` — System status and timestamp

### Authentication & Users
- `POST /api/auth/login` — Authenticate and receive JWT token + user profile
- `POST /api/auth/register` — Register a new account
- `GET /api/auth/me` — Return active user session
- `GET /api/users` — List all user accounts (*Admin only*)
- `GET /api/users/interviewers` — List active interviewers (*Recruiter / Admin*)
- `POST /api/users` — Create team member account (*Admin only*)
- `PATCH /api/users/:id/status` — Toggle user active/deactivated state (*Admin only*)
- `PATCH /api/users/:id/role` — Update user authorization role (*Admin only*)

### Dashboard & Analytics
- `GET /api/dashboard` — Aggregated metrics, pipeline counts, score distribution, recent applications, and upcoming interview rounds

### Job Requisitions
- `GET /api/jobs` — List all requisitions with active filters
- `GET /api/jobs/:id` — Retrieve single requisition details
- `POST /api/jobs` — Create new job requisition (*Recruiter / Admin*)
- `PATCH /api/jobs/:id/close` — Close requisition (*Recruiter / Admin*)
- `PATCH /api/jobs/:id/reopen` — Reopen requisition (*Recruiter / Admin*)

### Candidates & Applications
- `GET /api/candidates` — Searchable candidate directory with pagination
- `GET /api/candidates/:id` — Candidate profile with skills and applications
- `POST /api/candidates/:id/notes` — Append private recruiter note to dossier
- `GET /api/applications` — List applications with filters (stage, job, search, score)
- `GET /api/applications/:id` — Retrieve complete application dossier and history
- `POST /api/applications/:id/validate` — Submit checklist screening validation
- `POST /api/applications/:id/recalculate-score` — Recalculate deterministic match score
- `PATCH /api/applications/:id/status` — Advance application state via state machine
- `POST /api/applications/bulk-status` — Bulk transition multiple applications
- `POST /api/applications/:id/decision` — Final hiring decision (`SELECTED` / `REJECTED`)

### Interviews & Evaluations
- `GET /api/interviews` — List scheduled and completed interview rounds
- `POST /api/interviews` — Schedule interview round with panelist and meeting link
- `PATCH /api/interviews/:id/status` — Update interview round status
- `POST /api/evaluations` — Submit 5-competency interview evaluation scorecard
- `GET /api/evaluations/interview/:id` — Retrieve scorecard by interview ID

### Activity Notifications
- `GET /api/notifications` — Retrieve user activity alerts
- `PATCH /api/notifications/read-all` — Mark all notifications as read
- `PATCH /api/notifications/:id/read` — Mark single notification as read

---

## 🔑 13. Demo Accounts & Credentials

The seed data provisions three pre-configured accounts for testing each role:

> **Development & Demo Credentials Notice:**  
> These credentials are for local development and demonstration purposes only.

| Role | Email | Password | Primary Workflow |
| :--- | :--- | :--- | :--- |
| **Lead Recruiter** | `recruiter@hireflow.dev` | `Password123!` | Dashboard, 9-Stage Kanban, Job Postings, Candidate Dossiers, Screening |
| **Panel Interviewer** | `interviewer@hireflow.dev` | `Password123!` | Assigned Interview Rounds, Candidate Dossiers, 5-Competency Scorecards |
| **System Administrator** | `admin@hireflow.dev` | `Password123!` | User Directory, Role Management, Account Activation / Deactivation |

*Note: You can also use the one-click **Quick Workspace Role Access** buttons on the Login page or the **Workspace Role Switcher** in the sidebar footer.*

---

## 🖼️ 14. Screenshots & UI Previews

### 1. Recruitment Operations Dashboard
*Real-time KPI metrics, recruitment pipeline progression strip, deterministic candidate score distribution, upcoming panel interview rounds, and recent applicant dossier intake.*

### 2. 9-Stage Kanban Pipeline
*Visual Kanban board and tabular views with 9 state-machine enforced stages (`APPLIED`, `SCREENING`, `VALIDATED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `INTERVIEW_COMPLETED`, `SELECTED`, `REJECTED`, `HOLD`), multi-factor filters, and bulk status transitions.*

### 3. Candidate Dossier & Explainable Match Scorecard
*Deep-dive candidate view featuring the 100-point deterministic score breakdown (Skills, Experience, Projects, Education, Certifications), parsed resume viewer, production project links, screening checklist audit log, and chronological status transition history.*

### 4. Structured Interview Scorecards
*Panel workspace displaying upcoming and completed rounds, Google Meet virtual room links, and the 5-competency evaluation rubric with hiring recommendation options.*

### 5. Team & Security Administration
*Administrator user directory showing role badges, lifecycle status (Active/Deactivated), last login timestamps, user creation, and role switching modals.*

---

## 🔬 15. Automated QA & Test Verification

HireFlow features a 46-test automated suite verifying security, RBAC enforcement, state machine logic, score calculation, and end-to-end flows.

```bash
cd backend
npm test
```

### Test Suite Output:
```
PASS tests/api.test.js
  1. Health & Core System (1 test)
  2. Authentication & Authorization Security (8 tests)
  3. Job Requisitions Management (4 tests)
  4. Candidates & Applications Funnel (6 tests)
  5. Interview Scheduling & Scorecard Evaluation (4 tests)
  6. Scoring Engine & State Machine Unit Guarantees (2 tests)
  7. Operational Activity Notifications API (2 tests)

PASS tests/full_flow.test.js
  HireFlow Comprehensive Test Suite
    1. Authentication & RBAC (6 tests)
    2. Job Management (3 tests)
    3. Candidate & Application Workflow (6 tests)
    4. Interview Scheduling & Evaluation (3 tests)
    5. Dashboard Real Database Metrics (1 test)

Test Suites: 2 passed, 2 total
Tests:       46 passed, 46 total
Snapshots:   0 total
Time:        5.202 s
Ran all test suites.
```

---

## ⚠️ 16. Known Limitations

- **File Upload Storage:** Resumes are currently simulated using structured parsed text and mock storage URLs rather than an external AWS S3 or Google Cloud Storage bucket (intentionally kept local to avoid external API dependencies).
- **Calendar Synchronization:** Meeting links generate Google Meet URLs without direct Google Calendar OAuth2 integration.
- **WebSocket Streaming:** Activity notifications currently poll on component mount rather than using a persistent WebSocket connection.

---

## 🚀 17. Future Improvements

1. **Native PDF Viewer:** Inline PDF document rendering within the candidate dossier modal using `pdfjs-dist`.
2. **Google / Outlook Calendar Integration:** Bi-directional interview scheduling via Google Calendar API.
3. **Automated Email Triggers:** Integration with transactional email providers (SendGrid / Resend) for candidate status updates and interviewer reminders.
4. **Custom Evaluation Templates:** Ability for admins to configure department-specific evaluation rubrics per job requisition.
5. **Real-Time Push Notifications:** WebSockets or Server-Sent Events (SSE) for instant alerts across active recruiter sessions.

---

## 📄 18. License

This project is open-source under the [MIT License](LICENSE).
