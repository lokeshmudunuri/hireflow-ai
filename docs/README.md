# HireFlow Documentation

Welcome to the comprehensive technical documentation for **HireFlow — Applicant Screening & Interview Management System**.

## Documentation Sitemap

1. [Architecture & System Design](./ARCHITECTURE.md)
   - High-level system topology
   - Layered architecture (Controllers, Services, Models, Repositories)
   - Real-time reactivity and state transitions
2. [Installation & Setup Guide](./SETUP.md)
   - Prerequisites & environment setup
   - MySQL & SQLite configuration
   - Migration and Seeding commands
   - Running development server & tests
3. [Database Schema & Data Models](./DATABASE_AND_MODELS.md)
   - Entity-Relationship Diagram (ERD)
   - Model definitions & associations
   - Foreign key cascading & indexing strategy
4. [API Specification & Endpoints](./API_DOCUMENTATION.md)
   - Authentication & JWT format
   - Full REST API reference
   - Request bodies, response schemas, and HTTP status codes
5. [Candidate Scoring Algorithm](./SCORING_ALGORITHM.md)
   - Explainable 100-point formula
   - Transparent weights: Education, Experience, Required Skills, Projects, Certifications, Completeness
   - Non-AI, deterministic calculations
6. [Hiring Workflow & RBAC](./WORKFLOW_AND_RBAC.md)
   - Role-Based Access Control matrix (`admin`, `recruiter`, `interviewer`)
   - 9-Stage Application state machine & transition rules
   - Interview scheduling and 5-point evaluation guidelines
