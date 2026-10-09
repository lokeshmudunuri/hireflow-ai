-- ==============================================================================
-- HireFlow ATS — Complete Relational Database Schema DDL
-- Compatible with SQLite 3 and MySQL 8.0+
-- Generated for Sequelize ORM Relational Mapping
-- ==============================================================================

-- 1. Users Table (Core Authentication & System Personas)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Stored as bcrypt hash (10 salt rounds)
  role VARCHAR(20) NOT NULL DEFAULT 'recruiter', -- 'admin', 'recruiter', 'interviewer'
  is_active BOOLEAN NOT NULL DEFAULT 1,
  phone VARCHAR(50),
  department VARCHAR(100),
  last_login DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Recruiters Profile Table
CREATE TABLE IF NOT EXISTS recruiters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  title VARCHAR(100) DEFAULT 'Technical Recruiter',
  department VARCHAR(100) DEFAULT 'Talent Acquisition',
  agency VARCHAR(100) DEFAULT 'In-House Talent Team',
  assigned_team VARCHAR(100),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Interviewers Profile Table
CREATE TABLE IF NOT EXISTS interviewers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  title VARCHAR(100) DEFAULT 'Staff Software Engineer',
  specialization VARCHAR(100) DEFAULT 'Full Stack Engineering',
  skills TEXT, -- JSON array of specialized evaluation skills
  max_interviews_per_week INTEGER DEFAULT 5,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Job Requisitions Table
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  employment_type VARCHAR(50) DEFAULT 'Full-time',
  experience_requirement REAL NOT NULL DEFAULT 0,
  qualification VARCHAR(150) NOT NULL,
  required_skills TEXT NOT NULL, -- JSON array of required skills
  optional_skills TEXT, -- JSON array of optional skills
  salary_range VARCHAR(100),
  hiring_manager VARCHAR(100),
  description TEXT,
  deadline DATETIME,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'DRAFT'
  created_by_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);

-- 5. Candidates Table (Talent Pool Directory)
CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(50),
  location VARCHAR(100),
  headline VARCHAR(200),
  current_company VARCHAR(150),
  current_title VARCHAR(150),
  years_of_experience REAL NOT NULL DEFAULT 0,
  education_level VARCHAR(100),
  education_institution VARCHAR(150),
  education_major VARCHAR(100),
  education_year INTEGER,
  notice_period VARCHAR(50),
  expected_salary VARCHAR(100),
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  summary TEXT,
  projects TEXT, -- JSON array of documented production projects
  certifications TEXT, -- JSON array of certifications
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_exp ON candidates(years_of_experience);

-- 6. Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) DEFAULT 'Technical',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Candidate Skills Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS candidate_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency_level VARCHAR(50) DEFAULT 'Proficient',
  years_experience REAL DEFAULT 0,
  is_primary BOOLEAN DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(candidate_id, skill_id)
);

-- 8. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  parsed_text TEXT,
  is_primary BOOLEAN DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 9. Applications Table (9-Stage Lifecycle Funnel & Scoring)
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'APPLIED', 
  -- Allowed states: 'APPLIED', 'SCREENING', 'VALIDATED', 'SHORTLISTED', 
  -- 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED', 'HOLD'
  score INTEGER DEFAULT 0, -- Deterministic 100-pt Suitability Score
  score_breakdown TEXT, -- JSON itemized scoring breakdown
  validation_checklist TEXT, -- JSON screening audit items
  is_validated BOOLEAN DEFAULT 0,
  validated_by_id INTEGER,
  validated_at DATETIME,
  validation_notes TEXT,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_score ON applications(score);

-- 10. Application Status History (Immutable State Machine Audit Log)
CREATE TABLE IF NOT EXISTS application_status_histories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  previous_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by_id INTEGER NOT NULL,
  reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_id) REFERENCES users(id)
);

-- 11. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  interviewer_id INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  interview_type VARCHAR(100) DEFAULT 'Technical Architecture',
  location VARCHAR(255) DEFAULT 'https://meet.google.com/hfl-tech-sync',
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED'
  scheduled_by_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewer_id) REFERENCES users(id),
  FOREIGN KEY (scheduled_by_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- 12. Interview Feedback Table (5-Competency Rubric)
CREATE TABLE IF NOT EXISTS interview_feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interview_id INTEGER NOT NULL UNIQUE,
  application_id INTEGER NOT NULL,
  interviewer_id INTEGER NOT NULL,
  technical_skills_score REAL NOT NULL, -- Scale: 1-10 (UI displays 1-5)
  problem_solving_score REAL NOT NULL,
  communication_score REAL NOT NULL,
  project_knowledge_score REAL NOT NULL,
  role_fit_score REAL NOT NULL,
  overall_score REAL NOT NULL,
  recommendation VARCHAR(30) NOT NULL, -- 'Strong Hire', 'Hire', 'Hold', 'No Hire', 'Strong No Hire'
  strengths TEXT,
  areas_for_improvement TEXT,
  comments TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (interviewer_id) REFERENCES users(id)
);

-- 13. Recruiter Notes Table (Confidential Candidate Dossier Notes)
CREATE TABLE IF NOT EXISTS recruiter_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  application_id INTEGER,
  author_id INTEGER NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 14. Notifications Table (Recruitment Activity Feed)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'action'
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
