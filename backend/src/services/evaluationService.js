const { InterviewFeedback, Interview, Application, User, sequelize } = require('../models');
const { transitionApplicationState } = require('./stateMachineService');

async function submitEvaluation({
  interviewId,
  interviewerId,
  technicalSkillsScore,
  problemSolvingScore,
  communicationScore,
  projectKnowledgeScore,
  roleFitScore,
  recommendation,
  comments
}) {
  const interview = await Interview.findByPk(interviewId);
  if (!interview) {
    throw new Error(`Interview with ID ${interviewId} not found`);
  }

  // Calculate overall score (average of the 5 criteria, rounded to 1 decimal place)
  const scores = [
    Number(technicalSkillsScore),
    Number(problemSolvingScore),
    Number(communicationScore),
    Number(projectKnowledgeScore),
    Number(roleFitScore)
  ];

  const overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

  const transaction = await sequelize.transaction();
  try {
    // Check if feedback already exists
    let feedback = await InterviewFeedback.findOne({
      where: { interviewId }
    });

    if (feedback) {
      // Update existing feedback without erasing historical linkage
      feedback = await feedback.update({
        interviewerId,
        technicalSkillsScore,
        problemSolvingScore,
        communicationScore,
        projectKnowledgeScore,
        roleFitScore,
        overallScore,
        recommendation,
        comments,
        submittedAt: new Date()
      }, { transaction });
    } else {
      feedback = await InterviewFeedback.create({
        interviewId,
        applicationId: interview.applicationId,
        interviewerId,
        technicalSkillsScore,
        problemSolvingScore,
        communicationScore,
        projectKnowledgeScore,
        roleFitScore,
        overallScore,
        recommendation,
        comments,
        submittedAt: new Date()
      }, { transaction });
    }

    // Mark interview as COMPLETED
    await interview.update({ status: 'COMPLETED' }, { transaction });
    await transaction.commit();

    // Transition application to INTERVIEW_COMPLETED with auditable status history
    const application = await Application.findByPk(interview.applicationId);
    if (application && application.status === 'INTERVIEW_SCHEDULED') {
      try {
        await transitionApplicationState(
          interview.applicationId,
          'INTERVIEW_COMPLETED',
          interviewerId,
          `Interview round completed with recommendation: ${recommendation}`
        );
      } catch (e) {
        console.warn('Status transition warning:', e.message);
      }
    }

    return InterviewFeedback.findByPk(feedback.id, {
      include: [
        { model: User, as: 'interviewer', attributes: ['id', 'name', 'email'] },
        { model: Interview, as: 'interview' }
      ]
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw err;
  }
}

async function getEvaluationByInterviewId(interviewId) {
  return InterviewFeedback.findOne({
    where: { interviewId },
    include: [
      { model: User, as: 'interviewer', attributes: ['id', 'name', 'email'] }
    ]
  });
}

module.exports = {
  submitEvaluation,
  getEvaluationByInterviewId
};
