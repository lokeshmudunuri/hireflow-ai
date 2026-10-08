const request = require('supertest');
const app = require('../src/app');
const { connectDB, sequelize } = require('../src/config/database');
const { User, Job, Candidate, Application, Interview, InterviewFeedback } = require('../src/models');
const bcrypt = require('bcryptjs');

describe('HireFlow Comprehensive Test Suite', () => {
  let adminToken = '';
  let recruiterToken = '';
  let interviewerToken = '';
  let testJobId = null;
  let testCandidateId = null;
  let testApplicationId = null;
  let testInterviewId = null;
  let interviewerUserId = null;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Keep connection open for runner teardown
  });

  describe('1. Authentication & RBAC', () => {
    test('POST /api/auth/register should create a new user with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Recruiter',
          email: 'alice@hireflow.test',
          password: 'Password123!',
          role: 'recruiter',
          department: 'Talent Acquisition'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('alice@hireflow.test');
      expect(res.body.user.password).toBeUndefined();

      // Verify bcrypt hashing in DB
      const dbUser = await User.findOne({ where: { email: 'alice@hireflow.test' } });
      expect(dbUser.password).not.toBe('Password123!');
      const isMatch = await bcrypt.compare('Password123!', dbUser.password);
      expect(isMatch).toBe(true);

      recruiterToken = res.body.token;
    });

    test('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Alice',
          email: 'alice@hireflow.test',
          password: 'Password123!',
          role: 'recruiter'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered|already in use|exists/i);
    });

    test('POST /api/auth/login should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@hireflow.test',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Setup Admin and Interviewer roles for RBAC testing', async () => {
      const adminRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Master Admin',
          email: 'admin@hireflow.test',
          password: 'Password123!',
          role: 'admin'
        });
      expect(adminRes.status).toBe(201);
      adminToken = adminRes.body.token;

      const interviewerRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Interviewer',
          email: 'bob@hireflow.test',
          password: 'Password123!',
          role: 'interviewer'
        });
      expect(interviewerRes.status).toBe(201);
      interviewerToken = interviewerRes.body.token;
      interviewerUserId = interviewerRes.body.user.id;
    });

    test('RBAC: Interviewer cannot create a job (recruiter/admin only)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send({
          title: 'Unauthorized Job',
          department: 'Engineering',
          location: 'Remote',
          experienceRequirement: 3
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('RBAC: Non-admin cannot access user management endpoint', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('2. Job Management', () => {
    test('POST /api/jobs should allow recruiter to create job posting', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Full Stack Engineer',
          department: 'Engineering',
          location: 'Remote',
          employmentType: 'Full-time',
          experienceRequirement: 4,
          qualification: 'Bachelor in CS',
          requiredSkills: ['Node.js', 'React', 'MySQL', 'Docker'],
          description: 'High performance API and frontend developer',
          status: 'ACTIVE'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.job.id).toBeDefined();
      testJobId = res.body.job.id;
    });

    test('POST /api/jobs should validate required fields', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          department: 'Engineering'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('PUT /api/jobs/:id should update job status (e.g. close job)', async () => {
      const res = await request(app)
        .put(`/api/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'CLOSED'
        });

      expect(res.status).toBe(200);
      expect(res.body.job.status).toBe('CLOSED');

      // Reopen job
      await request(app)
        .put(`/api/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'ACTIVE' });
    });
  });

  describe('3. Candidate & Application Workflow', () => {
    test('POST /api/candidates should create candidate profile', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          firstName: 'Clara',
          lastName: 'Oswald',
          email: 'clara.oswald@example.com',
          phone: '+1 555 456 7890',
          location: 'London',
          headline: 'Full Stack Engineer | Node & React',
          educationLevel: 'Bachelor of Science',
          educationInstitution: 'University of London',
          educationMajor: 'Computer Science',
          yearsOfExperience: 5,
          summary: 'Full stack developer with 5 years experience',
          projects: [
            { name: 'Time Portal', tech: 'Node.js, React' },
            { name: 'TARDIS UI', tech: 'React, TypeScript' }
          ],
          certifications: [
            { name: 'AWS Associate', issuer: 'Amazon' }
          ],
          skills: ['Node.js', 'React', 'MySQL', 'Docker']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.candidate.id).toBeDefined();
      testCandidateId = res.body.candidate.id;
    });

    test('POST /api/applications should create application and calculate candidate score', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          jobId: testJobId,
          candidateId: testCandidateId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.application.score).toBeGreaterThan(60);
      expect(res.body.application.scoreBreakdown).toBeDefined();
      expect(res.body.application.status).toBe('APPLIED');
      testApplicationId = res.body.application.id;
    });

    test('GET /api/applications should filter applications by status and search', async () => {
      const res = await request(app)
        .get(`/api/applications?status=APPLIED&search=Clara`)
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.applications.length).toBeGreaterThanOrEqual(1);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    test('POST /api/applications/:id/validate should validate candidate checklist', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/validate`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          checklist: {
            detailsComplete: true,
            resumeAvailable: true,
            qualificationMet: true,
            experienceMet: true,
            skillsMet: true
          },
          notes: 'Candidate meets all prerequisites and has solid portfolio projects.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.application.isValidated).toBe(true);
      expect(res.body.application.status).toBe('VALIDATED');
    });

    test('PATCH /api/applications/:id/status should advance status to SHORTLISTED', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'SHORTLISTED',
          reason: 'Candidate shortlisted following profile validation.'
        });

      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe('SHORTLISTED');
    });

    test('PATCH /api/applications/:id/status should reject invalid transition (e.g. SHORTLISTED -> APPLIED)', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'APPLIED',
          reason: 'Attempt invalid backwards transition'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Interview Scheduling & Evaluation', () => {
    test('POST /api/interviews should schedule interview and update application status', async () => {
      const res = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          applicationId: testApplicationId,
          interviewerId: interviewerUserId,
          scheduledDate: '2026-10-15',
          scheduledTime: '15:30:00',
          interviewType: 'System Design & Problem Solving',
          location: 'https://meet.google.com/test-room',
          notes: 'Focus on distributed caching and concurrency.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.interview.status).toBe('SCHEDULED');
      testInterviewId = res.body.interview.id;

      // Verify application status changed to INTERVIEW_SCHEDULED
      const appRecord = await Application.findByPk(testApplicationId);
      expect(appRecord.status).toBe('INTERVIEW_SCHEDULED');
    });

    test('POST /api/evaluations should allow interviewer to submit structured score', async () => {
      const res = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${interviewerToken}`)
        .send({
          interviewId: testInterviewId,
          technicalSkillsScore: 9,
          problemSolvingScore: 8.5,
          communicationScore: 9,
          projectKnowledgeScore: 8.5,
          roleFitScore: 9.5,
          recommendation: 'Strong Hire',
          comments: 'Superb knowledge of system design, clear architectural explanation.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.evaluation.overallScore).toBeCloseTo(8.9, 1);
      expect(res.body.evaluation.recommendation).toBe('Strong Hire');

      // Verify application status moved to INTERVIEW_COMPLETED
      const appRecord = await Application.findByPk(testApplicationId);
      expect(appRecord.status).toBe('INTERVIEW_COMPLETED');
    });

    test('POST /api/applications/:id/decision should allow recruiter to make final hiring decision', async () => {
      const res = await request(app)
        .post(`/api/applications/${testApplicationId}/decision`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          decision: 'SELECTED',
          notes: 'Candidate passed all rounds with exceptional scores. Offer extended.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.application.status).toBe('SELECTED');
    });
  });

  describe('5. Dashboard Real Database Metrics', () => {
    test('GET /api/dashboard/stats should return real database aggregated counters', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${recruiterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.pipeline).toBeDefined();
      expect(Array.isArray(res.body.stats.pipeline)).toBe(true);
      const selectedStage = res.body.stats.pipeline.find(p => p.key === 'SELECTED');
      expect(selectedStage.count).toBeGreaterThanOrEqual(1);
    });
  });
});
