const { Interview, Application, Candidate, Job, User, InterviewFeedback, sequelize } = require('../models');
const { transitionApplicationState } = require('./stateMachineService');

async function scheduleInterview({
  applicationId,
  interviewerId,
  scheduledDate,
  scheduledTime,
  interviewType = 'Technical',
  location,
  notes,
  scheduledById
}) {
  const application = await Application.findByPk(applicationId, {
    include: [{ model: Candidate, as: 'candidate' }, { model: Job, as: 'job' }]
  });

  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }

  // Interviewer check
  const interviewer = await User.findByPk(interviewerId);
  if (!interviewer) {
    throw new Error(`Interviewer with ID ${interviewerId} not found`);
  }

  const transaction = await sequelize.transaction();
  try {
    const interview = await Interview.create({
      applicationId,
      interviewerId,
      scheduledDate,
      scheduledTime,
      interviewType,
      location: location || 'Virtual Meeting (Google Meet)',
      notes,
      status: 'SCHEDULED',
      scheduledById
    }, { transaction });

    // Transition application status if needed
    if (['SHORTLISTED', 'VALIDATED', 'SCREENING', 'APPLIED'].includes(application.status)) {
      await application.update({ status: 'INTERVIEW_SCHEDULED' }, { transaction });
    }

    await transaction.commit();

    return getInterviewById(interview.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getInterviews({ interviewerId, status, date, startDate, endDate }) {
  const where = {};
  if (interviewerId) where.interviewerId = interviewerId;
  if (status && status !== 'ALL') where.status = status;
  if (date) where.scheduledDate = date;

  return Interview.findAll({
    where,
    include: [
      {
        model: Application,
        as: 'application',
        include: [
          { model: Candidate, as: 'candidate' },
          { model: Job, as: 'job', attributes: ['id', 'title', 'department'] }
        ]
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'name', 'email']
      },
      {
        model: User,
        as: 'scheduler',
        attributes: ['id', 'name']
      },
      {
        model: InterviewFeedback,
        as: 'feedback'
      }
    ],
    order: [['scheduledDate', 'ASC'], ['scheduledTime', 'ASC']]
  });
}

async function getInterviewById(id) {
  return Interview.findByPk(id, {
    include: [
      {
        model: Application,
        as: 'application',
        include: [
          { model: Candidate, as: 'candidate' },
          { model: Job, as: 'job' }
        ]
      },
      {
        model: User,
        as: 'interviewer',
        attributes: ['id', 'name', 'email']
      },
      {
        model: InterviewFeedback,
        as: 'feedback'
      }
    ]
  });
}

async function updateInterviewStatus(id, newStatus, reason = '') {
  const interview = await Interview.findByPk(id);
  if (!interview) {
    throw new Error('Interview not found');
  }

  interview.status = newStatus;
  await interview.save();
  return interview;
}

module.exports = {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewStatus
};
