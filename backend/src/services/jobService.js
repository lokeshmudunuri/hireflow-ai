const { Job, Application, User, sequelize } = require('../models');

async function createJob(jobData, userId) {
  return Job.create({
    ...jobData,
    createdById: userId
  });
}

async function updateJob(id, updateData) {
  const job = await Job.findByPk(id);
  if (!job) {
    throw new Error(`Job with ID ${id} not found`);
  }
  return job.update(updateData);
}

async function closeJob(id) {
  const job = await Job.findByPk(id);
  if (!job) {
    throw new Error(`Job with ID ${id} not found`);
  }
  return job.update({ status: 'CLOSED' });
}

async function reopenJob(id) {
  const job = await Job.findByPk(id);
  if (!job) {
    throw new Error(`Job with ID ${id} not found`);
  }
  return job.update({ status: 'ACTIVE' });
}

async function getJobs({ status, department, search }) {
  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (department && department !== 'ALL') where.department = department;

  const jobs = await Job.findAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Application,
        as: 'applications',
        attributes: ['id', 'status', 'score']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Enrich with application metrics
  return jobs.map(job => {
    const jobJson = job.toJSON();
    const apps = jobJson.applications || [];
    const stats = {
      totalApplications: apps.length,
      pendingReview: apps.filter(a => ['APPLIED', 'SCREENING'].includes(a.status)).length,
      validated: apps.filter(a => a.status === 'VALIDATED').length,
      shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
      interviews: apps.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(a.status)).length,
      selected: apps.filter(a => a.status === 'SELECTED').length,
      rejected: apps.filter(a => a.status === 'REJECTED').length,
      avgScore: apps.length ? Math.round(apps.reduce((acc, a) => acc + (a.score || 0), 0) / apps.length) : 0
    };
    return {
      ...jobJson,
      stats
    };
  });
}

async function getJobById(id) {
  const job = await Job.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Application,
        as: 'applications',
        attributes: ['id', 'status', 'score', 'appliedAt']
      }
    ]
  });

  if (!job) {
    throw new Error(`Job with ID ${id} not found`);
  }

  const jobJson = job.toJSON();
  const apps = jobJson.applications || [];
  jobJson.stats = {
    totalApplications: apps.length,
    pendingReview: apps.filter(a => ['APPLIED', 'SCREENING'].includes(a.status)).length,
    shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
    selected: apps.filter(a => a.status === 'SELECTED').length
  };

  return jobJson;
}

module.exports = {
  createJob,
  updateJob,
  closeJob,
  reopenJob,
  getJobs,
  getJobById
};
