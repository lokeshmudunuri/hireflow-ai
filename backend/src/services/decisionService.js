const { Application, RecruiterNote } = require('../models');
const { transitionApplicationState } = require('./stateMachineService');

async function makeFinalDecision(applicationId, { decision, reason, notes, recruiterId }) {
  const allowedDecisions = ['SELECTED', 'REJECTED', 'HOLD'];
  if (!allowedDecisions.includes(decision)) {
    throw new Error(`Decision must be one of: ${allowedDecisions.join(', ')}`);
  }

  const application = await Application.findByPk(applicationId);
  if (!application) {
    throw new Error(`Application with ID ${applicationId} not found`);
  }

  // Transition application status with audit trail (handles its own transaction)
  await transitionApplicationState(
    application.id,
    decision,
    recruiterId,
    reason || `Final decision made: ${decision}`
  );

  // Save recruiter note if provided
  if (notes && notes.trim()) {
    await RecruiterNote.create({
      candidateId: application.candidateId,
      applicationId: application.id,
      authorId: recruiterId,
      note: `[FINAL DECISION - ${decision}] ${notes}`
    });
  }

  const { getApplicationById } = require('./applicationService');
  return getApplicationById(applicationId);
}

module.exports = {
  makeFinalDecision
};
