const { Application, Job, Candidate, Interview, User, sequelize } = require('../models');
const { Op } = require('sequelize');

async function getDashboardStats() {
  // Aggregate real application counts by status
  const applications = await Application.findAll({
    attributes: ['id', 'status', 'score', 'appliedAt', 'jobId', 'createdAt'],
    raw: true
  });

  const totalApplications = applications.length;
  const pendingReview = applications.filter(a => ['APPLIED', 'SCREENING'].includes(a.status)).length;
  const validated = applications.filter(a => a.status === 'VALIDATED').length;
  const shortlisted = applications.filter(a => a.status === 'SHORTLISTED').length;
  const interviews = applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(a.status)).length;
  const selected = applications.filter(a => a.status === 'SELECTED').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;
  const onHold = applications.filter(a => a.status === 'HOLD').length;

  // Pipeline stages breakdown
  const pipeline = [
    { stage: 'Applied', count: applications.filter(a => a.status === 'APPLIED').length, key: 'APPLIED', color: '#6366f1' },
    { stage: 'Screening', count: applications.filter(a => a.status === 'SCREENING').length, key: 'SCREENING', color: '#8b5cf6' },
    { stage: 'Validated', count: validated, key: 'VALIDATED', color: '#06b6d4' },
    { stage: 'Shortlisted', count: shortlisted, key: 'SHORTLISTED', color: '#3b82f6' },
    { stage: 'Interview', count: interviews, key: 'INTERVIEW', color: '#f59e0b' },
    { stage: 'Selected', count: selected, key: 'SELECTED', color: '#10b981' },
    { stage: 'Rejected', count: rejected, key: 'REJECTED', color: '#ef4444' }
  ];

  // Jobs statistics
  const totalJobs = await Job.count();
  const activeJobs = await Job.count({ where: { status: 'ACTIVE' } });
  const totalCandidates = await Candidate.count();
  const totalInterviews = await Interview.count();

  // Score distribution for chart
  const scoreDistribution = {
    '90-100': applications.filter(a => a.score >= 90).length,
    '75-89': applications.filter(a => a.score >= 75 && a.score < 90).length,
    '60-74': applications.filter(a => a.score >= 60 && a.score < 75).length,
    '40-59': applications.filter(a => a.score >= 40 && a.score < 60).length,
    '0-39': applications.filter(a => a.score < 40).length
  };

  // Recent applications (last 5)
  const recentApplications = await Application.findAll({
    include: [
      { model: Candidate, as: 'candidate', attributes: ['id', 'firstName', 'lastName', 'email', 'headline'] },
      { model: Job, as: 'job', attributes: ['id', 'title', 'department'] }
    ],
    order: [['appliedAt', 'DESC']],
    limit: 6
  });

  // Upcoming interviews (next 5)
  const upcomingInterviews = await Interview.findAll({
    where: { status: 'SCHEDULED' },
    include: [
      {
        model: Application,
        as: 'application',
        include: [
          { model: Candidate, as: 'candidate', attributes: ['id', 'firstName', 'lastName'] },
          { model: Job, as: 'job', attributes: ['id', 'title'] }
        ]
      },
      { model: User, as: 'interviewer', attributes: ['id', 'name', 'email'] }
    ],
    order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']],
    limit: 5
  });

  return {
    metrics: {
      totalApplications,
      pendingReview,
      validated,
      shortlisted,
      interviews,
      selected,
      rejected,
      onHold,
      totalJobs,
      activeJobs,
      totalCandidates,
      totalInterviews
    },
    pipeline,
    scoreDistribution,
    recentApplications,
    upcomingInterviews
  };
}

module.exports = {
  getDashboardStats
};
