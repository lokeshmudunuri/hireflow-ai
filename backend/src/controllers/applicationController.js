const applicationService = require('../services/applicationService');
const stateMachineService = require('../services/stateMachineService');

const createApplication = async (req, res, next) => {
  try {
    const { jobId, candidateId } = req.body;
    const application = await applicationService.createApplication({
      jobId,
      candidateId,
      userId: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (err) {
    next(err);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const { page, limit, search, status, jobId, minExp, maxExp, skill, sortBy, sortOrder } = req.query;
    const result = await applicationService.getApplications({
      page,
      limit,
      search,
      status,
      jobId,
      minExp,
      maxExp,
      skill,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (err) {
    next(err);
  }
};

const validateApplication = async (req, res, next) => {
  try {
    const { checklist, validationNotes, decision } = req.body;
    const finalDecision = decision || (req.body.status === 'VALIDATED' ? 'VALIDATED' : 'VALIDATED');
    const updatedApplication = await applicationService.validateApplication(req.params.id, {
      checklist,
      validationNotes,
      decision: finalDecision,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: `Application validation processed: ${finalDecision}`,
      application: updatedApplication
    });
  } catch (err) {
    next(err);
  }
};

const recalculateScore = async (req, res, next) => {
  try {
    const scoreData = await applicationService.recalculateScore(req.params.id);
    res.json({
      success: true,
      message: 'Candidate score calculated successfully',
      ...scoreData
    });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const application = await stateMachineService.transitionApplicationState(
      req.params.id,
      status,
      req.user.id,
      reason
    );

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      application
    });
  } catch (err) {
    next(err);
  }
};

const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { applicationIds, targetStatus, reason } = req.body;
    const results = await applicationService.bulkUpdateStatus(
      applicationIds,
      targetStatus,
      req.user.id,
      reason
    );

    res.json({
      success: true,
      message: `Bulk update completed (${results.successful.length} succeeded, ${results.failed.length} failed)`,
      results
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  validateApplication,
  recalculateScore,
  updateStatus,
  bulkUpdateStatus
};
