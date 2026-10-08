# HireFlow Setup & Execution Guide

## 1. Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **MySQL**: (Optional) MySQL 8.x database. If MySQL is not running, HireFlow automatically falls back to an embedded SQLite database (`hireflow_dev.sqlite`) for instant zero-config execution.

## 2. Environment Configuration

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=hireflow_super_secure_jwt_secret_key_2026_production
JWT_EXPIRES_IN=7d

# Database Configuration (MySQL)
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=hireflow
DB_USER=root
DB_PASSWORD=

# Fallback SQLite DB path when MySQL is unavailable
SQLITE_STORAGE=./hireflow_dev.sqlite

# Client Configuration
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=/api
```

## 3. Installation Commands

From root directory:
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## 4. Database Setup & Seeding

```bash
# Run Sequelize schema migration
cd backend && npm run migrate

# Populate database with realistic seed data (Users, Jobs, Candidates, Applications, Interviews, Evaluations)
npm run seed
```

## 5. Running the Application

### Start Backend API Server (Port 5000)
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Application (Port 5173)
```bash
cd frontend
npm run dev
# Web application opens on http://localhost:5173
```

## 6. Running Test Suite

```bash
cd backend
npm test
```
Runs the full Jest + Supertest suite testing Authentication, RBAC, Job Management, Candidate Scoring, Application State Machine, Interview Scheduling, Interview Evaluations, and Aggregated Dashboard metrics.

## 7. Default Demo Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@hireflow.dev` | `Password123!` | System settings, user management, full access |
| **Recruiter** | `recruiter@hireflow.dev` | `Password123!` | Jobs, applicants, screening, interviews, decisions |
| **Interviewer** | `interviewer@hireflow.dev` | `Password123!` | Assigned candidate profiles, submit evaluations |
