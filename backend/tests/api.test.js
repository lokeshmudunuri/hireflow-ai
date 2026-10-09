const request = require('supertest');
const app = require('../src/app');
const { connectDB, sequelize } = require('../src/config/database');
const { User, Job, Candidate, Application, Interview, InterviewFeedback, Recruiter, Interviewer, Notification } = require('../src/models');
const { calculateCandidateScore } = require('../src/services/scoringService');
const { isValidTransition } = require('../src/services/stateMachineService');

let adminToken = '';
let recruiterToken = '';
let interviewerToken = '';
let testAdmin;
let testRecruiter;
let testInterviewer;
let testJob;
let testCandidate;
let testApplication;
let testInterview;

beforeAll(async () => {
  await connectDB();
  await sequelize.sync({ force: true });

  // 1. Create Admin
  testAdmin = await User.create({
    name: 'Admin User',
    email: 'admin@hireflow.test',
    password: 'Password123!',
    role: 'admin'
  });

  // 2. Create Recruiter
  testRecruiter = await User.create({
    name: 'Recruiter User',
    email: 'recruiter@hireflow.test',
    password: 'Password123!',
    role: 'recruiter'
  });
  await Recruiter.create({
    userId: testRecruiter.id,
    title: 'Lead Technical Recruiter'
  });

  // 3. Create Interviewer
  testInterviewer = await User.create({
    name: 'Interviewer User',
    email: 'interviewer@hireflow.test',
    password: 'Password123!',
    role: 'interviewer'
  });
  await Interviewer.create({
    userId: testInterviewer.id,
    title: 'Senior Staff Engineer',
    specialization: 'Distributed Systems'
  });

  // 4. Create Job
  testJob = await Job.create({
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    experienceRequirement: 5,
    qualification: "Bachelor's Degree",
    requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
    description: 'Lead engineering systems across modern recruitment stack.',
    salaryRange: '$140k - $170k',
    hiringManager: 'VP of Engineering',
    createdById: testRecruiter.id
  });

  // 5. Create Candidate
  testCandidate = await Candidate.create({
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@hireflow.test',
    yearsOfExperience: 5.5,
    educationLevel: "Bachelor's Degree",
    educationMajor: 'Computer Science',
    headline: 'Senior Full Stack Engineer | React & Node.js',
    currentCompany: 'Apex Systems',
    currentTitle: 'Senior Software Engineer',
    noticePeriod: '30 Days',
    expectedSalary: '$150k',
    summary: 'Experienced Full Stack Engineer with 5+ years building scalable cloud services.',
    projects: [
      { name: 'Workflow Platform', tech: 'React, Node.js', url: 'https://github.com/rahul/workflow' }
    ]
  });

  // 6. Create Application
  testApplication = await Application.create({
    jobId: testJob.id,
    candidateId: testCandidate.id,
    status: 'APPLIED',
    score: 82
  });

  // Login tokens
  const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@hireflow.test', password: 'Password123!' });
  adminToken = adminRes.body.token;

  const recruiterRes = await request(app).post('/api/auth/login').send({ email: 'recruiter@hireflow.test', password: 'Password123!' });
  recruiterToken = recruiterRes.body.token;

  const interviewerRes = await request(app).post('/api/auth/login').send({ email: 'interviewer@hireflow.test', password: 'Password123!' });
  interviewerToken = interviewerRes.body.token;
});

afterAll(async () => {
  // Keep connection open for runner teardown
});

describe('1. Health & Core System', () => {
  test('GET /api/health returns 200 with service metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('2. Authentication & Authorization Security', () => {
  test('Valid login returns JWT and user payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter@hireflow.test', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('recruiter');
  });

  test('Invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter@hireflow.test', password: 'WrongPassword!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Non-existent user returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@hireflow.test', password: 'Password123!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Protected endpoint rejects unauthenticated request (401)', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('Interviewer cannot access Admin user management (403)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${interviewerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Recruiter cannot access Admin user management (403)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin can access user management (200)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test('Admin can change a user role', async () => {
    const tempUser = await User.create({
      name: 'Temp User',
      email: 'temp@hireflow.test',
      password: 'Password123!',
      role: 'interviewer'
    });

    const res = await request(app)
      .patch(`/api/users/${tempUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'recruiter' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('recruiter');
  });
});

describe('3. Job Requisitions Management', () => {
  let createdJobId;

  test('Recruiter can create a job posting (201)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Cloud DevOps Architect',
        department: 'Infrastructure',
        location: 'Remote',
        employmentType: 'Full-time',
        experienceRequirement: 6,
        qualification: "Bachelor's Degree",
        requiredSkills: ['AWS', 'Kubernetes', 'Terraform'],
        description: 'Lead multi-region Kubernetes deployments.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.job.title).toBe('Cloud DevOps Architect');
    createdJobId = res.body.job.id;
  });

  test('Any authenticated user can list jobs (200)', async () => {
    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${interviewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
  });

  test('Recruiter can close a job posting (200)', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${createdJobId}/close`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe('CLOSED');
  });

  test('Recruiter can reopen a job posting (200)', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${createdJobId}/reopen`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe('ACTIVE');
  });
});

describe('4. Candidates & Applications Funnel', () => {
  test('GET /api/candidates returns candidate directory (200)', async () => {
    const res = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.candidates)).toBe(true);
  });

  test('GET /api/applications with filtering and pagination (200)', async () => {
    const res = await request(app)
      .get('/api/applications?status=APPLIED')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test('Recruiter can validate an application (200)', async () => {
    const res = await request(app)
      .post(`/api/applications/${testApplication.id}/validate`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        checklist: {
          requiredDetails: true,
          resumeAvailable: true,
          qualificationMet: true,
          experienceMet: true,
          skillsAvailable: true
        },
        validationNotes: 'Resume verified; qualifications confirmed.',
        decision: 'VALIDATED'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application.status).toBe('VALIDATED');
    expect(res.body.application.isValidated).toBe(true);
  });

  test('Recruiter can add candidate notes (201)', async () => {
    const res = await request(app)
      .post(`/api/candidates/${testCandidate.id}/notes`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        note: 'Candidate completed introductory screening discussion.',
        applicationId: testApplication.id
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.note.note).toContain('introductory screening');
  });

  test('Deterministic score calculation evaluates properly', async () => {
    const res = await request(app)
      .post(`/api/applications/${testApplication.id}/recalculate-score`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBeGreaterThanOrEqual(50);
    expect(res.body.scoreBreakdown).toBeDefined();
  });

  test('State machine advances status: VALIDATED -> SHORTLISTED', async () => {
    const res = await request(app)
      .patch(`/api/applications/${testApplication.id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'SHORTLISTED', reason: 'Top 10% match candidate' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application.status).toBe('SHORTLISTED');
  });

  test('State machine rejects invalid transition: SHORTLISTED -> SELECTED (400)', async () => {
    const res = await request(app)
      .patch(`/api/applications/${testApplication.id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'SELECTED', reason: 'Bypass interview' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('5. Interview Scheduling & Scorecard Evaluation', () => {
  test('Recruiter schedules interview round (201)', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        applicationId: testApplication.id,
        interviewerId: testInterviewer.id,
        scheduledDate: '2026-10-15',
        scheduledTime: '15:00',
        interviewType: 'Technical',
        location: 'https://meet.google.com/test-round'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.interview.status).toBe('SCHEDULED');
    testInterview = res.body.interview;
  });

  test('Interviewer submits scorecard evaluation (200)', async () => {
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${interviewerToken}`)
      .send({
        interviewId: testInterview.id,
        technicalSkillsScore: 9,
        problemSolvingScore: 8,
        communicationScore: 9,
        projectKnowledgeScore: 8,
        roleFitScore: 9,
        recommendation: 'Strong Hire',
        comments: 'Exceptional architectural depth and clean problem breakdown.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.evaluation.overallScore).toBe(8.6);
  });

  test('Interviewer can submit evaluation with No Hire recommendation (201)', async () => {
    // Update existing or create a second round
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${interviewerToken}`)
      .send({
        interviewId: testInterview.id,
        technicalSkillsScore: 3,
        problemSolvingScore: 4,
        communicationScore: 5,
        projectKnowledgeScore: 3,
        roleFitScore: 4,
        recommendation: 'No Hire',
        comments: 'Core skills and fundamentals fell below required bar.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.evaluation.recommendation).toBe('No Hire');
  });

  test('Invalid recommendation is rejected with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${interviewerToken}`)
      .send({
        interviewId: testInterview.id,
        technicalSkillsScore: 5,
        problemSolvingScore: 5,
        communicationScore: 5,
        projectKnowledgeScore: 5,
        roleFitScore: 5,
        recommendation: 'InvalidRecommendationString',
        comments: 'Testing validator.'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Application state transitions to INTERVIEW_COMPLETED following evaluation', async () => {
    const res = await request(app)
      .get(`/api/applications/${testApplication.id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('INTERVIEW_COMPLETED');
  });

  test('Recruiter makes final hiring decision: SELECTED (200)', async () => {
    const res = await request(app)
      .post(`/api/applications/${testApplication.id}/decision`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        decision: 'SELECTED',
        reason: 'Unanimous team approval and strong technical evaluation.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application.status).toBe('SELECTED');
  });
});

describe('6. Scoring Engine & State Machine Unit Guarantees', () => {
  test('Deterministic scoring calculates accurate 100-pt breakdown', () => {
    const candidate = {
      educationLevel: "Bachelor's Degree",
      yearsOfExperience: 6,
      projects: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      certifications: ['AWS Certified', 'CKAD'],
      phone: '+1 555 0199',
      linkedinUrl: 'https://linkedin.com/test',
      githubUrl: 'https://github.com/test',
      summary: 'Senior Engineer with deep domain knowledge and architecture experience',
      headline: 'Senior Full Stack'
    };

    const job = {
      title: 'Senior Engineer',
      qualification: "Bachelor's Degree",
      experienceRequirement: 5,
      requiredSkills: ['React', 'Node.js']
    };

    const skills = [{ name: 'React' }, { name: 'Node.js' }];

    const result = calculateCandidateScore(candidate, job, skills);
    expect(result.totalScore).toBeGreaterThanOrEqual(85);
    expect(result.breakdown.skills.score).toBe(20);
    expect(result.breakdown.projects.score).toBe(20);
    expect(result.breakdown.certifications.score).toBe(10);
  });

  test('State machine permits valid transitions and blocks illegal ones', () => {
    expect(isValidTransition('APPLIED', 'SCREENING')).toBe(true);
    expect(isValidTransition('SCREENING', 'VALIDATED')).toBe(true);
    expect(isValidTransition('VALIDATED', 'SHORTLISTED')).toBe(true);
    expect(isValidTransition('SHORTLISTED', 'INTERVIEW_SCHEDULED')).toBe(true);
    expect(isValidTransition('INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED')).toBe(true);
    expect(isValidTransition('INTERVIEW_COMPLETED', 'SELECTED')).toBe(true);

    expect(isValidTransition('APPLIED', 'SELECTED')).toBe(false);
    expect(isValidTransition('SCREENING', 'INTERVIEW_SCHEDULED')).toBe(false);
    expect(isValidTransition('APPLIED', 'INTERVIEW_COMPLETED')).toBe(false);
  });
});

describe('7. Operational Activity Notifications API', () => {
  beforeAll(async () => {
    await Notification.create({
      userId: testRecruiter.id,
      title: 'Interview Completed',
      message: 'Alex submitted 9.0/10 feedback',
      type: 'INTERVIEW',
      isRead: false
    });
  });

  test('GET /api/notifications returns user alerts (200)', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('PATCH /api/notifications/read-all marks all read (200)', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
