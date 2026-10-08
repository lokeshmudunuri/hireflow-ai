const interviewService = require('../services/interviewService');

const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, interviewerId, scheduledDate, scheduledTime, interviewType, location, notes } = req.body;
    const interview = await interviewService.scheduleInterview({
      applicationId,
      interviewerId,
      scheduledDate,
      scheduledTime,
      interviewType,
      location,
      notes,
      scheduledById: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Interview successfully scheduled',
      interview
    });
  } catch (err) {
    next(err);
  }
};

const getInterviews = async (req, res, next) => {
  try {
    const { interviewerId, status, date } = req.query;

    // If interviewer role, restrict default view to their own interviews unless specified by admin/recruiter
    let targetInterviewerId = interviewerId;
    if (req.user.role === 'interviewer') {
      targetInterviewerId = req.user.id;
    }

    const interviews = await interviewService.getInterviews({
      interviewerId: targetInterviewerId,
      status,
      date
    });

    res.json({
      success: true,
      interviews
    });
  } catch (err) {
    next(err);
  }
};

const getInterviewById = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(req.params.id);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Interviewer permission check: can view if assigned
    if (req.user.role === 'interviewer' && interview.interviewerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to view interviews assigned to you'
      });
    }

    res.json({
      success: true,
      interview
    });
  } catch (err) {
    next(err);
  }
};

const updateInterviewStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const interview = await interviewService.updateInterviewStatus(req.params.id, status, reason);
    res.json({
      success: true,
      message: `Interview status changed to ${status}`,
      interview
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewStatus
};
