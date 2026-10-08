const jobService = require('../services/jobService');

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job
    });
  } catch (err) {
    next(err);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const { status, department, search } = req.query;
    const jobs = await jobService.getJobs({ status, department, search });
    res.json({
      success: true,
      jobs
    });
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json({
      success: true,
      job
    });
  } catch (err) {
    next(err);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Job posting updated successfully',
      job
    });
  } catch (err) {
    next(err);
  }
};

const closeJob = async (req, res, next) => {
  try {
    const job = await jobService.closeJob(req.params.id);
    res.json({
      success: true,
      message: 'Job posting marked as CLOSED',
      job
    });
  } catch (err) {
    next(err);
  }
};

const reopenJob = async (req, res, next) => {
  try {
    const job = await jobService.reopenJob(req.params.id);
    res.json({
      success: true,
      message: 'Job posting reopened (ACTIVE)',
      job
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  closeJob,
  reopenJob
};
