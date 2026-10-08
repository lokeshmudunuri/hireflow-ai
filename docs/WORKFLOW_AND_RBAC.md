# Hiring Workflow & RBAC Specification

## 1. Role-Based Access Control (RBAC)

HireFlow enforces granular Role-Based Access Control via `src/middleware/roleMiddleware.js`:

| Resource / Action | Admin | Recruiter | Interviewer |
|-------------------|:-----:|:---------:|:-----------:|
| **User Management** (`/api/users`) | Full | Denied | Denied |
| **Job Postings** (Create, Update, Close) | Full | Full | Denied |
| **Application Review** (Browse, Filter, Search) | Full | Full | Denied |
| **Application Validation** (`/api/applications/:id/validate`) | Full | Full | Denied |
| **Status State Transitions** (`/api/applications/:id/status`) | Full | Full | Denied |
| **Schedule Interviews** (`/api/interviews`) | Full | Full | Denied |
| **View Assigned Interviews** (`/api/interviews`) | Full | Full | Assigned Only |
| **Submit Evaluation** (`/api/evaluations`) | Full | Denied | Assigned Only |
| **Final Hiring Decision** (`/api/applications/:id/decision`) | Full | Full | Denied |
| **Dashboard Metrics** (`/api/dashboard`) | Full | Full | Denied |

---

## 2. 9-Stage Application State Machine

Applications transition through 9 standardized states. The state machine in `src/services/stateMachineService.js` strictly validates allowed transitions:

```
[APPLIED] ──────────────────────────┐
   │                                │
   ▼                                │
[SCREENING] ────────────────────────┼──────────┐
   │                                │          │
   ▼                                │          │
[VALIDATED] ────────────────────────┼──────────┤
   │                                │          │
   ▼                                │          │
[SHORTLISTED] ──────────────────────┼──────────┤
   │                                │          │
   ▼                                │          │
[INTERVIEW_SCHEDULED] ──────────────┤          ▼
   │                                │       [HOLD]
   ▼                                │          ▲
[INTERVIEW_COMPLETED] ──────────────┤          │
   │                                │          │
   ├───────────────┐                │          │
   ▼               ▼                ▼          │
[SELECTED]     [REJECTED] ──────────┴──────────┘
```

### Transition Matrix

| Source Status | Allowed Target Statuses |
|---------------|-------------------------|
| `APPLIED` | `SCREENING`, `VALIDATED`, `REJECTED`, `HOLD` |
| `SCREENING` | `VALIDATED`, `SHORTLISTED`, `REJECTED`, `HOLD` |
| `VALIDATED` | `SHORTLISTED`, `SCREENING`, `REJECTED`, `HOLD` |
| `SHORTLISTED` | `INTERVIEW_SCHEDULED`, `VALIDATED`, `REJECTED`, `HOLD` |
| `INTERVIEW_SCHEDULED` | `INTERVIEW_COMPLETED`, `SHORTLISTED`, `REJECTED`, `HOLD` |
| `INTERVIEW_COMPLETED` | `SELECTED`, `REJECTED`, `HOLD`, `INTERVIEW_SCHEDULED` |
| `HOLD` | `SCREENING`, `VALIDATED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `SELECTED`, `REJECTED` |
| `REJECTED` | `SCREENING`, `HOLD` *(Allows reconsideration with audit trail)* |
| `SELECTED` | `HOLD` |

---

## 3. Interview Evaluation Structure

Interviewers submit structured numeric feedback across **5 core competencies** (1 to 10 points each):
1. **Technical Skills** (Code cleanliness, architecture, language idioms)
2. **Problem Solving** (Algorithm thinking, trade-off analysis, edge cases)
3. **Communication** (Clarity of thoughts, articulation, listening)
4. **Project Knowledge** (Ownership depth, production war-stories)
5. **Role Fit** (Collaboration mindset, cultural addition, initiative)

### Recommendations:
- `Strong Hire`: Overall score $\ge 9.0$
- `Hire`: Overall score $\ge 7.5$
- `Hold`: Borderline candidate or requires additional panel round
- `Reject`: Does not meet role requirements
