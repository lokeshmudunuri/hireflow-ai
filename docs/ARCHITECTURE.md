# HireFlow Architecture & System Design

## 1. System Topology

HireFlow is built as a high-performance modern Applicant Tracking System (ATS) tailored for recruiters handling hundreds to thousands of applications.

```
                      +-----------------------------+
                      |       Client Browser        |
                      |   React 18 + Vite (SPA)     |
                      +--------------+--------------+
                                     |
                         HTTP / REST API (JSON)
                         JWT Bearer Authentication
                                     v
                      +-----------------------------+
                      |      Node.js / Express      |
                      |     Backend Web Server      |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
        +------------+        +--------------+        +------------+
        | Middleware |        | Controllers  |        |  Services  |
        | - JWT Auth |        | - Validation |        | - Scoring  |
        | - RBAC     |        | - HTTP Resp  |        | - State M. |
        +------------+        +--------------+        +-----+------+
                                                            |
                                                     Sequelize ORM
                                                            v
                                              +-------------+------------+
                                              |        Database          |
                                              | MySQL 8.x / SQLite Dev   |
                                              +--------------------------+
```

## 2. Layered Architecture

The backend strictly separates responsibilities across decoupled layers:

- **Routes (`src/routes/`)**: Define endpoints, attach rate limiting and route-level middlewares, specify express-validator validation rules, and pass requests to controllers.
- **Controllers (`src/controllers/`)**: Parse and sanitize input, call relevant business services, format HTTP responses, and delegate errors to the centralized error handler.
- **Services (`src/services/`)**: Enforce all domain logic, state machine constraints, deterministic candidate score calculations, and database transaction boundaries.
- **Models (`src/models/`)**: Define Sequelize data entities, data types, indexes, hooks (e.g. bcrypt password hashing), and relational associations.
- **Middleware (`src/middleware/`)**: JWT verification, Role-Based Access Control (`authorize('admin', 'recruiter')`), input validation, and centralized exception logging.

## 3. Real-Time State Progression & Audit Logging

Every change to an application status must adhere to the formal state transition graph defined in `stateMachineService.js`. When any transition occurs:
1. Validity of the transition (`currentStatus` -> `newStatus`) is validated against allowed transitions.
2. A database transaction updates the application status.
3. An immutable entry in `application_status_history` is written containing `applicationId`, `previousStatus`, `newStatus`, `changedById`, `timestamp`, and `reason`.
