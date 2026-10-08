# Deterministic & Explainable Candidate Scoring Engine

HireFlow calculates an objective, algorithmic suitability score for every candidate application out of **100 points**. 

> **IMPORTANT PRINCIPLE**:
> HireFlow never uses opaque "AI black-box" heuristics or external AI APIs for candidate scoring. Every score is 100% deterministic, auditable, and backed by an itemized mathematical breakdown that recruiters can inspect and justify.

---

## Point Distribution (Total: 100 Points)

| Category | Maximum Points | Description |
|----------|----------------|-------------|
| **1. Education** | 20 points | Highest degree attained & relevance to minimum requirement |
| **2. Experience** | 20 points | Total professional years compared to job requirement |
| **3. Required Skills Match** | 20 points | Proportion of essential job skills verified in candidate profile |
| **4. Technical Projects** | 20 points | Depth of real-world production & portfolio projects |
| **5. Certifications** | 10 points | Industry-recognized certifications verified |
| **6. Profile Completeness** | 10 points | Contact, LinkedIn, GitHub/Portfolio, and summary completeness |

---

## Mathematical Breakdown

### 1. Education (Max: 20 pts)
- **PhD / Doctorate**: 20 pts
- **Master's Degree (M.S. / M.Eng)**: 18 pts
- **Bachelor's Degree (B.S. / B.A)**: 15 pts
- **Associate Degree**: 13 pts
- **Diploma / High School**: 10 pts
- *Bonus*: +2 pts if the candidate's exact degree major matches the job qualification requirement (capped at 20).

### 2. Experience (Max: 20 pts)
Ratio $R = \frac{\text{Candidate Years}}{\text{Required Years}}$:
- $R \ge 1.5$: 20 pts
- $1.0 \le R < 1.5$: 18 pts
- $0.75 \le R < 1.0$: 14 pts
- $0.5 \le R < 0.75$: 10 pts
- $R < 0.5$: $\max(4, \text{round}(R \times 15))$ pts

### 3. Required Skills Match (Max: 20 pts)
$$\text{Skill Score} = \text{round}\left( \frac{\text{Matched Required Skills}}{\text{Total Required Skills}} \times 20 \right)$$

### 4. Technical Projects (Max: 20 pts)
- $\ge 3$ documented projects: 20 pts
- 2 documented projects: 16 pts
- 1 documented project: 10 pts
- 0 projects: 0 pts

### 5. Certifications (Max: 10 pts)
- $\ge 2$ certifications: 10 pts
- 1 certification: 6 pts
- 0 certifications: 2 pts (baseline)

### 6. Profile Completeness (Max: 10 pts)
Evaluates 5 identity verification checkpoints (2 pts each):
- Phone Number provided (+2)
- LinkedIn Profile URL (+2)
- GitHub or Portfolio Link (+2)
- Detailed Professional Summary (+2)
- Headline / Specialization (+2)

---

## Sample JSON Breakdown

```json
{
  "totalScore": 94,
  "breakdown": {
    "education": {
      "score": 20,
      "max": 20,
      "details": "Master of Science in Computer Science (University of Washington)"
    },
    "experience": {
      "score": 20,
      "max": 20,
      "details": "6 yrs total professional experience vs 5 yrs required for Senior Full Stack Engineer"
    },
    "skills": {
      "score": 20,
      "max": 20,
      "details": "Matched 6 of 6 required skills (React, Node.js, TypeScript, MySQL, Docker, AWS)"
    },
    "projects": {
      "score": 20,
      "max": 20,
      "details": "3 portfolio/production project(s) documented with architecture breakdown"
    },
    "certifications": {
      "score": 10,
      "max": 10,
      "details": "2 industry certification(s) verified"
    },
    "completeness": {
      "score": 4,
      "max": 10,
      "details": "Verified: Phone, LinkedIn, Github/Portfolio, Professional Summary, Headline"
    }
  }
}
```
