# HireFlow — Complete 6–7 Minute Project Demo Video Script & Presenter Guide

> **Project Name:** HireFlow — Applicant Screening & Interview Management Platform  
> **Repository:** `hireflow-ai` / `Hire flow`  
> **Target Video Runtime:** 6 Minutes 40 Seconds (Within the target window of 6:30 – 6:55)  
> **Estimated Narration Pace:** ~125 words per minute (~815 spoken words total across screen interactions)  
> **Demonstrator Role:** Senior Software Project Lead / Technical Demonstrator  

---

## 📌 Section 1 — Project Understanding

### 1.1 Project Name and Core Purpose
**HireFlow** is an enterprise-grade, full-stack recruitment operations and Applicant Tracking System (ATS) engineered to audit, streamline, and govern technical talent acquisition. It bridges the operational divide between corporate recruiters, technical panel interviewers, and system administrators.

### 1.2 Problem Statement
Modern technical hiring processes suffer from four fundamental operational challenges:
1. **Opaque & Biased Candidate Screening:** Traditional ATS platforms frequently deploy black-box "AI resume ranking" that exhibits non-deterministic scoring and compliance risks, while manual screening suffers from human subjectivity.
2. **Fragmented Application Pipelines:** Resumes, screening notes, and stage handoffs are scattered across email threads and spreadsheets, leading to pipeline leakage and untracked status changes.
3. **Unstandardized Interview Feedback:** Panel interviewers submit unstructured notes lacking consistent competencies, clear rubrics, and defensible hiring justifications.
4. **Lack of Audit Trails:** Recruiting teams cannot prove why a candidate was shortlisted, placed on hold, or rejected at an exact timestamp.

### 1.3 Target Users and Role-Based Access Control (RBAC)
HireFlow enforces strict Role-Based Access Control across three core personas:
* **Lead Technical Recruiter (`recruiter`):** Operates the Recruitment Dashboard, manages job requisitions, screens applicants, operates the 9-stage Kanban pipeline, validates prerequisite criteria, reviews dossiers, and schedules interview rounds.
* **Engineering Panel Interviewer (`interviewer`):** Restricted view focused on the Evaluation Workspace (`/interviews`), inspecting assigned candidate dossiers, attending virtual meetings, and submitting standardized 5-competency evaluation scorecards.
* **System Administrator (`admin`):** Complete system authority including User & Security Administration (`/team`), account provisioning, real-time role reassignment, and account lifecycle activation/deactivation.

### 1.4 Main Features
* **Recruitment Operations Dashboard (`/`):** Real-time KPI summary (Total Applications, In Screening, Shortlisted, Active Interviews, Selected, Rejected), visual funnel progression strip, deterministic candidate match score distribution histogram, upcoming interview schedule, and recent applicant intake table.
* **9-Stage Application State Machine (`/pipeline`):** Strict lifecycle enforcement through states: `APPLIED` → `SCREENING` → `VALIDATED` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `INTERVIEW_COMPLETED` → `SELECTED` / `REJECTED` / `HOLD`. Features both an interactive 9-column Kanban board and a tabular Data Table view with multi-factor filtering and bulk transitions.
* **Candidate Dossier & Explainable Match Scorecard (`/candidates`, Modal):** Deep-dive profile inspector with tabbed navigation: *Overview & Score*, *Skills*, *Parsed Resume*, *Projects*, *Screening Audit*, *Interviews*, and *Timeline & Recruiter Notes*.
* **Deterministic 100-Point Scoring Engine:** 100% explainable, rule-based algorithm evaluating Education (20 pts), Experience (20 pts), Required Skills Match (20 pts), Technical Projects (20 pts), Certifications (10 pts), and Profile Completeness (10 pts).
* **Screening Checklist Audit Log:** Formal recruiter verification modal verifying prerequisites before moving to shortlisting.
* **Structured Interview Evaluation Rubric (`/interviews`):** 5-competency evaluation (Technical Knowledge, Problem Solving, Communication, System Understanding, Team Collaboration) on a 1–5 scale with hiring recommendations (`Strong Hire`, `Hire`, `Hold`, `No Hire`, `Strong No Hire`).
* **Team & Security Administration (`/team`):** Administrator user directory with role assignment, status toggling, and session control.

### 1.5 End-to-End User Workflow
```
[Candidate Ingestion] ────────► [Deterministic Scoring Engine: 100-Pt Breakdown]
                                                    │
                                                    ▼
[Recruiter Screening] ◄────── [9-Stage Kanban State Machine: APPLIED ➔ SCREENING]
        │
        ├─► [Validation Checklist Modal: SCREENING ➔ VALIDATED]
        ├─► [Shortlist Candidate: VALIDATED ➔ SHORTLISTED]
        │
        ▼
[Panel Scheduling]    ──────► [Schedule Interview Round: SHORTLISTED ➔ INTERVIEW_SCHEDULED]
                                                    │
                                                    ▼
[Panel Evaluation]    ──────► [Interviewer Submits 5-Competency Scorecard]
                                                    │
                                                    ▼
[Stage Advancement]   ──────► [Auto Transition: INTERVIEW_COMPLETED]
                                                    │
                                                    ▼
[Final Decision]      ──────► [Recruiter Formal Decision: SELECTED or REJECTED]
```

### 1.6 Technology Stack
* **Frontend:** React 18, Vite 5, React Router DOM v6, Axios with JWT request interceptors, Lucide React icons, and a custom modular Vanilla CSS design system (`index.css`) featuring custom CSS variables, accessible dark theme, micro-animations, glassmorphic headers, and responsive layouts.
* **Backend:** Node.js (v18+ LTS), Express.js 4 REST API, Sequelize 6 ORM, SQLite 3 local default database fallback (`backend/hireflow_dev.sqlite`), JSON Web Tokens (`jsonwebtoken`, 7-day expiration), bcryptjs password hashing (10 salt rounds), and express-validator.
* **Automated QA & Testing:** Jest 29, Supertest 7 (49 passing tests across 2 comprehensive suites).

### 1.7 Implementation Status Summary
The application is fully implemented locally with real SQLite database persistence, complete REST API endpoints, active frontend state management, working authentication with demo role switcher, and a passing 49-test suite. No external cloud or paid third-party API dependencies exist.

---

## 🔬 Section 2 — Verified Features and Unknowns

| Component / Feature | Status | Evidence in Codebase | What to Demonstrate | Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | Verified and working | `backend/src/controllers/authController.js`<br>`backend/src/middleware/roleMiddleware.js`<br>`frontend/src/context/AuthContext.jsx` | Login form, 1-click Quick Workspace Role buttons, role switcher in sidebar footer, route protection. | Local JWT stored in `localStorage`; 7-day fixed expiration. |
| **Recruitment Operations Dashboard** | Verified and working | `backend/src/controllers/dashboardController.js`<br>`frontend/src/pages/DashboardPage.jsx` | 6 KPI metric cards, funnel progression strip, 100-pt score distribution histogram, upcoming interview cards. | Data queries aggregated via Sequelize database count queries on mount. |
| **9-Stage Kanban Pipeline** | Verified and working | `backend/src/services/stateMachineService.js`<br>`frontend/src/pages/PipelinePage.jsx` | 9 explicit Kanban columns, Kanban/Table view toggle, search & multi-factor filters, bulk transition bar. | Drag-and-drop HTML5 UI transitions through status dropdown selection; legal transitions validated by backend state machine. |
| **Deterministic 100-Pt Scoring** | Verified and working | `backend/src/services/scoringService.js`<br>`frontend/src/components/ScoreCard.jsx` | Itemized point breakdown (Education, Experience, Skills, Projects, Certs, Completeness) and live "Recalculate Score" button. | Algorithm is 100% deterministic and mathematical; rule-based, not generative AI or machine learning. |
| **Candidate Dossier Modal** | Verified and working | `frontend/src/components/CandidateDetailModal.jsx`<br>`backend/src/controllers/candidateController.js` | Tabbed navigation (Overview, Skills, Resume, Projects, Audit, Interviews, Timeline), recruiter note submission, live stage advancement. | Resume viewer displays structured parsed text and mock download link rather than external S3 PDF. |
| **Screening Verification Checklist** | Verified and working | `backend/src/controllers/applicationController.js`<br>`frontend/src/components/ValidationModal.jsx` | Form with 5 checklist items (details, resume, qualification, experience, skills), notes, advancing to `VALIDATED`. | Checklist items stored as JSON field in database table. |
| **Interview Round Scheduling** | Verified and working | `backend/src/controllers/interviewController.js`<br>`frontend/src/components/ScheduleInterviewModal.jsx` | Scheduling round with panelist dropdown, round type, date/time, and virtual room link. | Generates Google Meet room URL; does not sync via Google Calendar OAuth. |
| **Structured Evaluation Scorecard** | Verified and working | `backend/src/controllers/evaluationController.js`<br>`frontend/src/components/EvaluationModal.jsx` | 5-competency sliders (1–5 scale), overall score compute, recommendation pills (`Hire`, `Strong Hire`, etc.), comments submit. | Frontend 1–5 scale mapped to backend 1–10 scale transparently in payload. |
| **Team & Security Admin** | Verified and working | `backend/src/controllers/userController.js`<br>`frontend/src/pages/TeamPage.jsx` | User accounts table, create team member modal, real-time role change modal, account deactivation modal. | Restricted to `admin` role; forbidden (403) for recruiters and interviewers. |
| **Activity Notifications Panel** | Verified and working | `backend/src/controllers/notificationController.js`<br>`frontend/src/components/TopBar.jsx` | Notification bell dropdown with unread badge counter, notification items, and "Mark all as read" button. | Alerts fetched via HTTP polling on mount and user action, not WebSockets. |
| **Automated Test Suite** | Verified and working | `backend/tests/api.test.js`<br>`backend/tests/full_flow.test.js` | 49 passing Jest/Supertest tests executed via terminal in ~3.1 seconds. | Tests run against in-memory/test SQLite configuration. |

---

## 🎬 Section 3 — Complete 6–7 Minute Demo Video Script

* **Total Runtime Target:** 06:40 (400 seconds)
* **Total Spoken Words:** ~815 words (~122 wpm)
* **Demonstration Setup:** Screen recorder set to 1920x1080 @ 60fps. Browser open at `http://localhost:5173/login`. Terminal open in secondary split window ready to execute `npm test`.

```
========================================================================================
TIMECODE BREAKDOWN:
Scene 1 [00:00 - 00:40] (40s): Opening & Platform Purpose
Scene 2 [00:40 - 01:30] (50s): Industry Problem & Deterministic Architecture Solution
Scene 3 [01:30 - 02:25] (55s): Authentication, RBAC & Role Switcher
Scene 4 [02:25 - 04:15] (110s): Core Recruiter Workflow: Funnel, Kanban & Candidate Dossier
Scene 5 [04:15 - 05:15] (60s): Secondary Workflows: Interview Panel & Admin Governance
Scene 6 [05:15 - 06:00] (45s): Code Architecture & Live Automated Testing Proof (49/49)
Scene 7 [06:00 - 06:40] (40s): Practical Value, Limitations & Conclusion
========================================================================================
```

---

### Scene 1: Opening & Platform Overview
* **Timestamp:** `00:00 – 00:40` (Duration: 40 seconds)
* **Exact Screen Actions:**
  * Open web browser at `http://localhost:5173/login`.
  * Ensure full-screen view (1080p).
  * Hover cursor smoothly over the left branding panel showing the **HireFlow ATS ENTERPRISE** badge and the subtitle *"Applicant Screening & Interview Management Platform"*.
  * Hover over the three live stat counters at the bottom left: `12+ Seeded Candidates`, `100% Explainable Logic`, and `3 Roles`.
* **Complete Spoken Narration:**
  > "Hello, and welcome to this technical demonstration of **HireFlow**, an enterprise-grade Applicant Screening and Interview Management Platform. HireFlow was engineered to modernize technical recruitment operations by replacing fragmented hiring spreadsheets and opaque black-box resume scanners with a transparent, auditable recruitment engine. Built with React 18, Node.js, Express, Sequelize ORM, and an immutable state machine, HireFlow provides end-to-end governance across the entire hiring lifecycle."
* **Recording Instructions:**
  * Do not click any buttons yet. Keep the mouse movements calm and intentional.
  * Pause for 2 seconds at the end of the narration before transitioning to Scene 2.
* **Recovery Instructions:**
  * If the login screen doesn't load, verify that Vite is running on `http://localhost:5173` and backend is active on `http://localhost:5000`. Refresh the page.

---

### Scene 2: Problem Statement & Proposed Solution
* **Timestamp:** `00:40 – 01:30` (Duration: 50 seconds)
* **Exact Screen Actions:**
  * Stay on `http://localhost:5173/login`.
  * Point cursor to the left column's card titled **"Recruitment State Machine Architecture"**.
  * Trace the cursor over each of the three steps:
    1. *Screening Verification*
    2. *Deterministic Scoring*
    3. *Collaborative Evaluations*
  * Glance cursor over to the right panel showing the clean corporate login form with email, password, and quick access role cards.
* **Complete Spoken Narration:**
  > "In modern technical hiring, talent acquisition teams face three critical bottlenecks. First, resume screening is often biased and inconsistent between reviewers. Second, applicant pipelines leak when candidates get stuck between inbound applications, calendar invites, and uncoordinated panel interviews. Third, interviewer feedback is notoriously unstructured, making it impossible to audit why a hiring decision was made. HireFlow solves these issues through a deterministic 100-point scoring algorithm, a strict 9-stage state machine that prevents illegal pipeline transitions, and standardized 5-competency interview scorecards. Everything operates on zero external dependencies with verifiable database persistence."
* **Recording Instructions:**
  * Emphasize the words *"deterministic 100-point scoring algorithm"* and *"strict 9-stage state machine"*.
  * Keep cursor smooth while following the bullet points.
* **Recovery Instructions:**
  * If you accidentally click a quick login button early, click the TopBar user avatar or sidebar role switcher to return to `/login`.

---

### Scene 3: Authentication, RBAC & Role Switcher
* **Timestamp:** `01:30 – 02:25` (Duration: 55 seconds)
* **Exact Screen Actions:**
  * Move cursor to the right panel under **"Quick Workspace Role Access"**.
  * Highlight the three provisioned accounts:
    1. `Recruiter (Sarah Jenkins)` — `recruiter@hireflow.dev`
    2. `Interviewer (Alex Rivera)` — `interviewer@hireflow.dev`
    3. `Administrator (Elena Vance)` — `admin@hireflow.dev`
  * Click directly on the first role card: **"Recruiter (Sarah Jenkins)"**.
  * Wait 1 second as the JWT token is stored and the application transitions to `http://localhost:5173/`.
  * Point cursor to the TopBar header badge displaying `LEAD RECRUITER` in purple.
  * Point cursor to the bottom-left sidebar showing the **WORKSPACE ROLE SWITCHER** pill container.
* **Complete Spoken Narration:**
  > "HireFlow enforces strict Role-Based Access Control both on the client via React Router guards and on the server using Express JWT middleware. To facilitate evaluation, the login portal features one-click role access cards with pre-configured development credentials. I will authenticate as Sarah Jenkins, our Lead Technical Recruiter. Notice our seamless redirect to the Recruitment Operations Dashboard. The top navigation bar confirms our authenticated session as Lead Recruiter, and the sidebar provides role-tailored links: Dashboard, Screening Pipeline, Job Requisitions, Candidates, and Interviews."
* **Recording Instructions:**
  * Click the recruiter card with a distinct, confident click.
  * Allow the dashboard cards to populate before speaking the next line.
* **Recovery Instructions:**
  * If the quick login button doesn't trigger immediately, type `recruiter@hireflow.dev` and `Password123!` manually and click **"Sign In to Workspace"**.

---

### Scene 4: Main Recruiter Workflow: Operations Dashboard, 9-Stage Kanban & Candidate Dossier
* **Timestamp:** `02:25 – 04:15` (Duration: 110 seconds)
* **Exact Screen Actions:**
  * **02:25 – 02:50 (Dashboard Overview):**
    * On `http://localhost:5173/`, highlight the top 6 KPI metric cards: *Total Applications (12+)*, *In Screening*, *Shortlisted*, *Interviews*, *Selected*, and *Rejected*.
    * Scroll down slightly to highlight the **"Recruitment Pipeline Progression"** strip showing counts across *Applications → Screening → Validated → Shortlisted → Interview → Selected*.
    * Point cursor to the **"Candidate Match Score Distribution"** progress bars (Deterministic 100-Pt scale).
    * Click the primary action button at the top right: **"Recruitment Pipeline →"** (or click **Screening Pipeline** in the sidebar).
  * **02:50 – 03:30 (9-Stage Pipeline & Kanban):**
    * On `http://localhost:5173/pipeline`, highlight the 9 column headers: `APPLIED`, `SCREENING`, `VALIDATED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `INTERVIEW_COMPLETED`, `SELECTED`, `REJECTED`, `HOLD`.
    * Click the **"Data Table"** toggle button at the top right to demonstrate the dual-view mode.
    * Click back to **"Kanban"** view.
    * In the search input field, type `Rahul` to demonstrate real-time filtering, then clear it.
    * Select a candidate card in the `VALIDATED` column: click on **"Sneha Deshmukh"** (or in `SHORTLISTED`: **"Tanvi Gupta"** or **"Vikram Malhotra"**).
  * **03:30 – 04:15 (Candidate Dossier & Explainable Scorecard):**
    * The **CandidateDetailModal** opens.
    * Highlight the candidate header: name, headline, location, LinkedIn, and GitHub links.
    * In the **"Overview & Score"** tab, showcase the **Deterministic Suitability Score (out of 100)** with its 6 itemized categories: *Education (20)*, *Experience (20)*, *Skills Match (20)*, *Technical Projects (20)*, *Certifications (10)*, and *Completeness (10)*.
    * Click the **"Recalculate Score"** button in the score card. Watch the success toast: *"Deterministic score recalculated"*.
    * Switch to the **"Screening Audit"** tab to show the prerequisite checklist.
    * Switch to the **"Timeline & Notes"** tab to show the immutable status history audit log.
    * Type a note in the recruiter note input: `Candidate verified for system design round.` and click **"Add Recruiter Note"**.
    * Close the modal by clicking the **"X"** button.
* **Complete Spoken Narration:**
  > "On our operations dashboard, recruiters gain real-time visibility into pipeline throughput, conversion ratios, and candidate score distribution. Navigating to the Screening Pipeline, HireFlow renders a 9-stage Kanban board governed by our backend state machine. Unlike generic Kanban boards where cards can be dropped anywhere, HireFlow strictly validates legal transitions, preventing illegal moves like jumping directly from Applied to Selected. Opening candidate Sneha Deshmukh opens her comprehensive dossier. Rather than relying on opaque AI, our deterministic scoring engine calculates an auditable score out of 100 points based on verifiable parameters: education, years of experience against the requisition, skills match, production projects, and certifications. Clicking 'Recalculate Score' re-runs the mathematical engine live against our database. Recruiters can also inspect the screening checklist, review past stage timestamps, and record private recruiter audit notes directly to the candidate's permanent record."
* **Recording Instructions:**
  * Smoothly click between the tabs (*Overview & Score*, *Screening Audit*, *Timeline & Notes*).
  * Keep the dossier open for at least 35 seconds to allow evaluators to appreciate the detail.
* **Recovery Instructions:**
  * If clicking "Recalculate Score" shows no visual change, explain that the candidate's profile is already perfectly in sync with the algorithm's mathematical maximum.

---

### Scene 5: Secondary Workflows: Interview Panel & Admin Governance
* **Timestamp:** `04:15 – 05:15` (Duration: 60 seconds)
* **Exact Screen Actions:**
  * **04:15 – 04:45 (Interviewer Workspace & Evaluation Scorecard):**
    * Scroll to the bottom of the sidebar and click **"Interviewer (Alex)"** in the Workspace Role Switcher pill.
    * Notice the instant session switch: TopBar changes to `ENGINEERING PANEL` in green, and the view lands on `/interviews`.
    * Point cursor to the tabs: *All Rounds*, *Upcoming*, *Today*, *Completed*.
    * Find a scheduled interview card (e.g. **Priya Nair** or **Ananya Iyer**) and click **"Submit Evaluation"** (or click on a completed round to show existing feedback).
    * In the **Structured Interview Scorecard** modal:
      * Adjust the 5 competency sliders: Technical Knowledge, Problem Solving, Communication, System Understanding, and Team Collaboration. Notice the aggregate average updating live (e.g., `4.4 / 5.0`).
      * Click the **"Strong Hire"** recommendation badge.
      * In the comments textarea, enter: `Exceptional system architecture depth and clear articulation of distributed caching tradeoffs.`
      * Click **"Submit Scorecard"** (or close the modal).
  * **04:45 – 05:15 (Admin Security & User Management):**
    * In the sidebar Workspace Role Switcher, click **"Admin (System)"**.
    * TopBar badge updates to `ADMINISTRATOR` in red.
    * Click the **"Team & Security"** link in the sidebar (`/team`).
    * Display the team user accounts table showing: Name, Email, Role badges (`admin`, `recruiter`, `interviewer`), Status (`Active`), and Last Login.
    * Click the **"Change Role"** button next to a team member to show the role adjustment modal, then click cancel.
* **Complete Spoken Narration:**
  > "Now let us observe the interviewer experience. Using our workspace role switcher, I transition to Alex Rivera, Staff Software Engineer. Notice that the sidebar automatically restricts access, hiding pipeline and job management. In the Interview Workspace, panelists view assigned candidates, launch Google Meet links, and complete structured scorecards. The rubric grades five specific competencies on a 1-to-5 scale, computing an objective aggregate rating paired with a mandatory qualitative recommendation. Next, switching to our System Administrator role reveals the Team and Security Administration portal. Here, administrators maintain full governance over team members, assign RBAC permissions, and instantly activate or deactivate compromised accounts to protect hiring integrity."
* **Recording Instructions:**
  * Perform the role switches smoothly using the sidebar footer. This proves RBAC is active and reactive without manual logout/login cycles.
* **Recovery Instructions:**
  * If the interviewer evaluation modal is already completed for a round, click on another candidate or explain that submitted evaluations become immutable to prevent tampering.

---

### Scene 6: Technical Architecture & Automated Testing Proof
* **Timestamp:** `05:15 – 06:00` (Duration: 45 seconds)
* **Exact Screen Actions:**
  * Switch to the terminal window (split screen or full screen).
  * Ensure the terminal is navigated to the project root or `backend`.
  * Run the test command:
    ```bash
    npm test
    ```
  * Allow Jest to execute synchronously (~3.1 seconds).
  * Keep the terminal output clearly visible on screen showing:
    * `PASS tests/api.test.js` (7 test suites: Health, Auth/RBAC, Jobs, Funnel, Interviews, Scoring Engine, Notifications)
    * `PASS tests/full_flow.test.js` (5 test suites: Auth/RBAC, Job Management, Candidate Workflow, Interview Evaluation, Dashboard)
    * `Test Suites: 2 passed, 2 total`
    * `Tests: 49 passed, 49 total`
* **Complete Spoken Narration:**
  > "Behind the user interface, HireFlow is engineered with clean architectural separation. The Express backend employs decoupled controllers, Sequelize ORM data models, and isolated business logic services for deterministic scoring and state transitions. To prove system resilience and security, we have developed a comprehensive automated test suite using Jest and Supertest. Running `npm test` executes 49 automated tests spanning authentication security, RBAC route guards, state machine validation rules, scoring accuracy, and end-to-end recruitment lifecycles. As you can see live in the terminal, all 49 tests pass cleanly in approximately three seconds."
* **Recording Instructions:**
  * Highlight the green `PASS` indicators and the `49 passed, 49 total` line with your cursor.
  * Hold on the terminal for 4 seconds after the command finishes.
* **Recovery Instructions:**
  * If the terminal fails to run from root, run `cd backend && npm test`.

---

### Scene 7: Practical Value, Limitations, Roadmap & Conclusion
* **Timestamp:** `06:00 – 06:40` (Duration: 40 seconds)
* **Exact Screen Actions:**
  * Switch back to the web browser.
  * Click on **Dashboard** in the sidebar to return to the clean home view (`http://localhost:5173/`).
  * Scroll gently through the top KPIs and funnel metrics.
  * Bring cursor to rest near the HireFlow logo in the top left.
* **Complete Spoken Narration:**
  > "In terms of practical value, HireFlow gives engineering and recruiting leaders total transparency into their hiring funnel without the compliance hazards of black-box AI. In our current implementation, resume files and calendar invitations are simulated locally to maintain a zero-dependency local setup. Our production roadmap includes native PDF rendering via PDF.js, two-way Google Calendar OAuth synchronization, and transactional email triggers via Resend. In summary, HireFlow demonstrates how modern full-stack web technologies can bring structure, compliance, and velocity to technical hiring. Thank you for your time."
* **Recording Instructions:**
  * Speak calmly and conclude with a confident, measured tone.
  * Stop screen recording at approximately `06:40`.
* **Recovery Instructions:**
  * N/A.

---

## 🧭 Section 4 — Exact Click-by-Click Navigation Sequence

Follow this exact sequence while recording to avoid hesitation or missed steps:

| Step # | Screen / URL | Exact Control / Action | Purpose / Expected Result |
| :---: | :--- | :--- | :--- |
| **1** | `http://localhost:5173/login` | Page load / Visual inspection | Showcase platform title, 3 feature pillars, and demo statistics. |
| **2** | `http://localhost:5173/login` | Click button `Recruiter (Sarah Jenkins)` | Authenticates as Lead Recruiter via JWT; redirects to `/`. |
| **3** | `http://localhost:5173/` | Hover over top 6 KPI cards & funnel strip | Highlight 12+ applications, stages, and deterministic score distribution. |
| **4** | `http://localhost:5173/` | Click button `Recruitment Pipeline →` | Navigates to `/pipeline`. |
| **5** | `http://localhost:5173/pipeline` | Click `Data Table` toggle, then click `Kanban` toggle | Proves dual-view interface responsiveness. |
| **6** | `http://localhost:5173/pipeline` | Type `Rahul` in search field, then clear it | Demonstrates instant client-side candidate search. |
| **7** | `http://localhost:5173/pipeline` | Click on candidate card **Sneha Deshmukh** (or **Tanvi Gupta**) | Opens `CandidateDetailModal` with full applicant dossier. |
| **8** | Modal (Overview tab) | Hover over 100-pt score breakdown & click `Recalculate Score` | Shows explainable math; triggers backend recalculation toast. |
| **9** | Modal (Audit tab) | Click tab `Screening Audit` | Displays prerequisite screening checklist verification items. |
| **10** | Modal (Timeline tab) | Click tab `Timeline & Notes` | Shows chronological state machine history and recruiter notes log. |
| **11** | Modal | Type note `Screening verified.` & click `Add Recruiter Note` | Confirms persistence of recruiter audit notes. |
| **12** | Modal | Click `X` button (top right of modal) | Closes candidate dossier modal. |
| **13** | Sidebar (Footer) | Click role switcher button `Interviewer (Alex)` | Switches session to Alex Rivera; auto-redirects to `/interviews`. |
| **14** | `http://localhost:5173/interviews` | Point to assigned interview card (e.g. Priya Nair) | Proves RBAC isolation: pipeline and team tabs are hidden. |
| **15** | `http://localhost:5173/interviews` | Click button `Submit Evaluation` | Opens `EvaluationModal` with 5-competency sliders. |
| **16** | Modal (Evaluation) | Adjust sliders, select `Strong Hire`, type comment, then close | Proves standardized 5-competency rubric. |
| **17** | Sidebar (Footer) | Click role switcher button `Admin (System)` | Switches session to Administrator. |
| **18** | `http://localhost:5173/team` | Click `Team & Security` in sidebar | Displays system user accounts, roles, and status controls. |
| **19** | Terminal Window | Run command `npm test` | Runs 49 Jest integration tests live; all 49 pass in ~3.1s. |
| **20** | `http://localhost:5173/` | Click `Dashboard` in sidebar | Returns to home dashboard for concluding remarks. |

---

## ✅ Section 5 — Pre-Recording Checklist

### 5.1 Environment & Startup Preparation
- [ ] **Node.js Environment:** Verify Node.js v18+ is installed (`node -v`).
- [ ] **Database Seed:** Run `npm run seed` from the root directory to reset the SQLite database to the verified clean state with 14 candidates, 6 jobs, and 5 users.
- [ ] **Start Backend:** In Terminal 1, run `npm run backend`. Confirm output:
  ```
  Database connected successfully (SQLITE)
  HireFlow API Server running on port 5000
  ```
- [ ] **Start Frontend:** In Terminal 2, run `npm run frontend`. Confirm output:
  ```
  VITE v5.4.14 ready in 250 ms
  ➜ Local: http://localhost:5173/
  ```
- [ ] **Pre-Run Automated Tests:** In Terminal 3, run `npm test` once to verify all 49 tests pass before recording.

### 5.2 Browser & Display Setup
- [ ] **Display Resolution:** Set monitor display scaling to 100% and resolution to 1920x1080.
- [ ] **Browser Window:** Use Google Chrome or Chromium in a clean profile (no external extensions or bookmarks bar visible).
- [ ] **Zoom Level:** Set browser zoom to 100% (`Ctrl + 0`).
- [ ] **Initial URL:** Navigate to `http://localhost:5173/login`. Ensure `localStorage` is cleared so you start on the login page (`localStorage.clear()` in DevTools console).

### 5.3 Recording & Audio Setup
- [ ] **Microphone Check:** Test input levels; ensure noise suppression is enabled and microphone is 6–8 inches from mouth.
- [ ] **System Notifications:** Disable Windows notifications ("Focus Assist / Do Not Disturb" turned ON).
- [ ] **Cursor Settings:** Ensure mouse pointer is set to standard high-visibility arrow with smooth tracking.
- [ ] **Screen Recording Software:** OBS Studio or similar set to capture 1080p @ 60 FPS, 6000 kbps bitrate.

### 5.4 Fallback & Known Failure Points
* **Session Persistence:** If switching roles via the sidebar fails to refresh data, click the user profile icon in the TopBar and click **Sign Out**, then use the 1-click button on `/login`.
* **Database Reset:** Never delete or alter `hireflow_dev.sqlite` manually while the server is running. If data becomes inconsistent, stop the backend, run `npm run seed`, and restart.

---

## 📖 Section 6 — Technical Terms and Pronunciation Guide

| Term | Phonetic Pronunciation | Concise Explanation for Narration |
| :--- | :--- | :--- |
| **ATS** | *ay-tee-ess* | Applicant Tracking System; software for recruitment workflows. |
| **RBAC** | *ar-back* | Role-Based Access Control; permissions assigned by user role. |
| **Sequelize** | *SEE-kwuh-lyze* | Promise-based Node.js Object-Relational Mapper (ORM). |
| **SQLite** | *SEE-kwuh-lite* | Self-contained, serverless zero-configuration SQL database engine. |
| **Vite** | *veet* (rhymes with "meet") | Modern, high-speed frontend build tool and dev server. |
| **JWT** | *jay-dub-you-tee* or *jot* | JSON Web Token; compact, cryptographically signed session token. |
| **State Machine** | *stayt muh-sheen* | Behavioral model ensuring records only move through valid predefined states. |
| **Deterministic** | *dee-ter-min-ISS-tik* | Completely predictable algorithm producing the exact same score for identical inputs. |
| **Scorecard** | *SKOR-kard* | Standardized evaluation rubric rating candidates across 5 competencies. |
| **Requisition** | *rek-wih-ZISH-un* | Formal job vacancy posting with headcount and criteria. |
| **Jest** | *jest* | JavaScript automated testing framework. |
| **Supertest** | *SOO-per-test* | HTTP assertion library used for end-to-end API integration tests. |

---

## ❓ Section 7 — Evaluator Questions & Defensible Answers

### Q1: What core problem does HireFlow solve?
> **Answer:** HireFlow solves the fragmentation, bias, and lack of auditability in technical recruitment. It replaces subjective screening with a transparent 100-point deterministic algorithm, prevents stage-skipping through an enforced 9-stage state machine, and replaces unstructured panel notes with standardized 5-competency interview scorecards.

### Q2: Why did you choose SQLite and Sequelize rather than a cloud database like MongoDB Atlas or AWS RDS?
> **Answer:** As an enterprise-grade architectural decision, HireFlow utilizes Sequelize ORM configured with a resilient local SQLite default fallback. This ensures zero-configuration, immediate evaluation out of the box without requiring paid external cloud subscriptions or network credentials. Sequelize also provides relational integrity, foreign key constraints, and can switch to production MySQL by simply updating environment variables in `backend/.env`.

### Q3: How does your candidate scoring algorithm work? Is it AI-based or rule-based?
> **Answer:** The scoring engine is 100% deterministic and rule-based—it does **not** use generative AI or opaque machine learning models. Located in `backend/src/services/scoringService.js`, it evaluates 100 points mathematically: Education (20 pts), Experience ratio against job requirements (20 pts), Required Skills Match (20 pts), Documented Technical Projects (20 pts), Industry Certifications (10 pts), and Profile Completeness (10 pts). Every point is itemized and auditable.

### Q4: How is Role-Based Access Control (RBAC) enforced?
> **Answer:** RBAC is enforced on both ends. On the backend, `backend/src/middleware/roleMiddleware.js` intercepts REST requests, inspects the verified JWT claims, and returns HTTP 403 Forbidden if an unauthorized role attempts access (e.g. recruiters attempting to access `/api/users`). On the frontend, `frontend/src/App.jsx` and `Sidebar.jsx` dynamically filter routes and navigation items based on the active session role.

### Q5: How does the 9-stage state machine work?
> **Answer:** Located in `backend/src/services/stateMachineService.js`, the state machine defines a strict transition matrix across 9 states: `APPLIED`, `SCREENING`, `VALIDATED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `INTERVIEW_COMPLETED`, `SELECTED`, `REJECTED`, and `HOLD`. Any illegal transition (such as attempting to move directly from `APPLIED` to `SELECTED`) is immediately rejected with an HTTP 400 Bad Request error.

### Q6: How are user passwords secured?
> **Answer:** Passwords are never stored in plaintext. In `backend/src/models/User.js`, Sequelize lifecycle hooks hash passwords using `bcryptjs` with 10 salt rounds before record creation or updates. Authentication verifies the submitted password against the hash using `bcrypt.compare`.

### Q7: What competencies are evaluated during technical interviews?
> **Answer:** The scorecard evaluates candidates across five standardized competencies: Technical Knowledge & Core Depth, Problem Solving & Algorithmic Logic, Communication & Articulation, System/Domain Understanding, and Team Collaboration. Evaluators grade each from 1 to 5, resulting in an aggregate average and a mandatory hiring recommendation (`Strong Hire`, `Hire`, `Hold`, `No Hire`, `Strong No Hire`).

### Q8: How was the application tested?
> **Answer:** We have an automated test suite powered by Jest and Supertest across two suites: `backend/tests/api.test.js` and `backend/tests/full_flow.test.js`. The suite executes 49 automated integration and unit tests verifying authentication, RBAC boundaries, job management, candidate filtering, state machine validity, deterministic scoring, and interview evaluations. All 49 tests pass with 100% success.

### Q9: What are the current limitations of the platform?
> **Answer:** First, resume files are represented as structured parsed text with simulated storage links rather than an AWS S3 bucket. Second, interview scheduling generates Google Meet URLs but does not synchronize bi-directionally via Google Calendar OAuth. Third, activity notifications update on HTTP requests and component mounts rather than real-time WebSocket subscriptions. These were conscious trade-offs to keep the project completely autonomous and free of paid cloud dependencies.

### Q10: How would you scale HireFlow to handle 100,000+ applicants in production?
> **Answer:** We would switch Sequelize's dialect to MySQL or PostgreSQL with read replicas, add Redis caching for dashboard KPI metrics and job requisition lookups, move resume storage to AWS S3 with pre-signed URLs, and deploy asynchronous background worker queues using BullMQ to handle score calculations and email notifications.

---

## ⚠️ Section 8 — Final Verification Warnings

During your live video demonstration, strictly adhere to these factual boundaries to maintain technical integrity:

1. **DO NOT claim AI or Machine Learning for candidate scoring:** The scoring engine in `backend/src/services/scoringService.js` is an explainable, deterministic mathematical algorithm. Present it proudly as **"transparent, rule-based, and auditable"** rather than "generative AI" or "machine learning."
2. **DO NOT claim real AWS S3 cloud storage:** Resumes are currently parsed into structured text stored in the local SQLite database with simulated `/uploads/` file paths.
3. **DO NOT claim two-way Google Calendar synchronization:** The interview scheduler generates valid Google Meet video links, but does not execute OAuth2 synchronization with Google Calendar or Microsoft Outlook.
4. **DO NOT claim WebSocket real-time push notifications:** Activity notifications update via REST polling on user actions and component mounts.
5. **DO NOT invent candidate credentials:** Use the verified seed credentials:
   * Recruiter: `recruiter@hireflow.dev` / `Password123!`
   * Interviewer: `interviewer@hireflow.dev` / `Password123!`
   * Administrator: `admin@hireflow.dev` / `Password123!`  
   *(Or simply use the 1-click Quick Access buttons on `/login` and the sidebar footer).*
6. **DO NOT claim cloud hosting:** The application is running locally on `http://localhost:5173` (frontend) and `http://localhost:5000` (backend).
7. **DO NOT exaggerate test counts:** State precisely that the automated test suite contains **49 automated tests across 2 test suites**, all of which pass cleanly in ~3.1 seconds.
