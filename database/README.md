# HireFlow ATS — Database Architecture & Operations Guide

This directory houses the version-controlled schema, migrations, seeders, and verification utilities for the **HireFlow** recruitment platform.

---

## 🗄️ 1. Database Overview

* **ORM Framework:** [Sequelize 6](https://sequelize.org/)
* **Default Database Dialect:** **SQLite 3** (`hireflow_dev.sqlite` located in `backend/`)
* **Production Alternative:** **MySQL 8.0+** (Configured via `backend/.env`)
* **Entity Count:** 14 relational models with strict foreign key constraints and cascading rules.

---

## 📁 2. Directory Structure

```
database/
├── README.md                      # This database operations guide
├── schema.sql                     # Full SQL DDL schema definitions (SQLite & MySQL compatible)
├── init.js                        # Database initialization & table statistics inspector
├── verify_user.js                 # CLI tool to verify registered users and bcrypt security
├── migrations/
│   ├── 001_initial_schema.js      # Initial schema migration module
│   └── run_migrations.js          # Migration runner (`npm run db:migrate`)
└── seeds/
    ├── 001_seed_hireflow.js       # ATS seed orchestrator
    └── run_seeds.js               # Seed runner (`npm run db:seed`)
```

---

## 🚀 3. Quickstart Commands

All commands can be executed from the project root:

| Action | Root Command | Description |
| :--- | :--- | :--- |
| **Verify Registered User** | `node database/verify_user.js <email>` | Queries real DB for user and verifies bcrypt password hash |
| **List Recent Users** | `node database/verify_user.js` | Displays table of recently registered user accounts |
| **Initialize Database** | `node database/init.js` | Synchronizes all 14 tables and prints record counts |
| **Run Migrations** | `npm run db:migrate` | Runs all version-controlled schema migrations |
| **Seed Demo Data** | `npm run db:seed` | Resets & seeds 5 users, 6 jobs, 14 candidates, and scorecards |

---

## 🔍 4. Verifying Real Database Persistence

To prove that a newly registered user from the sign-up page actually exists in the real database (and is not an in-memory or mock placeholder), run:

```bash
node database/verify_user.js <user-email>
```

### Example Verification Output:
```text
==============================================================
🔍 HireFlow Real Database — User Verification Tool
==============================================================
Database connected successfully (SQLITE)
📡 Connected to database dialect: SQLITE
🔎 Searching for user record: "recruiter@hireflow.dev"...

✅ USER RECORD VERIFIED IN DATABASE:
--------------------------------------------------------------
  Database ID:       2
  Full Name:         Sarah Jenkins
  Normalized Email:  recruiter@hireflow.dev
  Assigned Role:     RECRUITER
  Account Status:    Active (Permitted)
  Department:        Talent Acquisition
  Password Security: Verified (Secure bcrypt 10-round hash)
  Created At:        2026-10-09T11:05:52.000Z
--------------------------------------------------------------
🎉 Verification Status: PASSED (Verified real database persistence)
```

---

## 📊 5. Relational Schema Summary

1. `users`: Core authentication identity, role (`admin`, `recruiter`, `interviewer`), bcrypt password hash.
2. `recruiters`: Recruiter profile, agency, assigned team.
3. `interviewers`: Panel interviewer specialization and weekly round limits.
4. `jobs`: Requisition parameters, experience requirement, required skills, salary bands.
5. `candidates`: Talent profile, education credentials, verified experience, GitHub/LinkedIn URLs.
6. `skills`: Normalized skill dictionary.
7. `candidate_skills`: Many-to-many relationship linking candidates to validated skills.
8. `resumes`: Parsed resume text and simulated storage URLs.
9. `applications`: 9-stage pipeline state (`APPLIED` through `SELECTED`/`REJECTED`), 100-point deterministic score.
10. `application_status_histories`: Immutable state machine audit trail with timestamps.
11. `interviews`: Scheduled rounds, virtual meeting rooms, panelists.
12. `interview_feedbacks`: 5-competency evaluation rubric and hiring recommendation.
13. `recruiter_notes`: Private recruiter dossier notes.
14. `notifications`: Real-time operational activity alerts.

---

## ⚙️ 6. Switching to MySQL (Optional)

To connect to a live MySQL server instead of the local SQLite default, edit `backend/.env`:

```env
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hireflow
DB_USER=root
DB_PASSWORD=your_password
```

Then run `npm run db:init` to create all tables in MySQL. If MySQL is unreachable, the system automatically falls back gracefully to local SQLite.
