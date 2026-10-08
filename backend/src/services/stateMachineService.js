const { Application, ApplicationStatusHistory, Notification, sequelize } = require('../models');

/**
 * Valid Application States:
 * APPLIED, SCREENING, VALIDATED, SHORTLISTED,
 * INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED,
 * SELECTED, REJECTED, HOLD
 */
const VALID_TRANSITIONS = {
  APPLIED: ['SCREENING', 'VALIDATED', 'REJECTED', 'HOLD'],
  SCREENING: ['VALIDATED', 'SHORTLISTED', 'REJECTED', 'HOLD'],
  VALIDATED: ['SHORTLISTED', 'SCREENING', 'REJECTED', 'HOLD'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'VALIDATED', 'REJECTED', 'HOLD'],
  INTERVIEW_SCHEDULED: ['INTERVIEW_COMPLETED', 'SHORTLISTED', 'REJECTED', 'HOLD'],
  INTERVIEW_COMPLETED: ['SELECTED', 'REJECTED', 'HOLD', 'INTERVIEW_SCHEDULED'],
  HOLD: ['SCREENING', 'VALIDATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED'],
  REJECTED: ['SCREENING', 'HOLD'], // Allow reconsideration with justification
  SELECTED: ['HOLD']
};

/**
 * Check if a state transition is permitted
 */
function isValidTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
}

/**
 * Perform application status transition with database transaction and audit log
 */
async function transitionApplicationState(applicationId, newStatus, userId, reason = null) {
  const application = await Application.findByPk(applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }

  const previousStatus = application.status;

  if (previousStatus === newStatus) {
    return application;
  }

  if (!isValidTransition(previousStatus, newStatus)) {
    throw new Error(`Invalid status transition from "${previousStatus}" to "${newStatus}"`);
  }

  const transaction = await sequelize.transaction();
  try {
    application.status = newStatus;
    await application.save({ transaction });

    await ApplicationStatusHistory.create({
      applicationId: application.id,
      previousStatus,
      newStatus,
      changedById: userId || null,
      reason: reason || `Status changed from ${previousStatus} to ${newStatus}`
    }, { transaction });

    await transaction.commit();
    return application;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = {
  VALID_TRANSITIONS,
  isValidTransition,
  transitionApplicationState
};
