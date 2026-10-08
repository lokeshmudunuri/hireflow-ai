const evaluationService = require('../services/evaluationService');
const { Interview } = require('../models');

const submitEvaluation = async (req, res, next) => {
  try {
    const {
      interviewId,
      technicalSkillsScore,
      problemSolvingScore,
      communicationScore,
      projectKnowledgeScore,
      roleFitScore,
      recommendation,
      comments
    } = req.body;

    const interview = await Interview.findByPk(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Interviewer role can only submit evaluation for their assigned interview
    if (req.user.role === 'interviewer' && interview.interviewerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only evaluate candidates for interviews assigned to you'
      });
    }

    const evaluation = await evaluationService.submitEvaluation({
      interviewId,
      interviewerId: req.user.id,
      technicalSkillsScore,
      problemSolvingScore,
      communicationScore,
      projectKnowledgeScore,
      roleFitScore,
      recommendation,
      comments
    });

    res.status(201).json({
      success: true,
      message: 'Interview evaluation submitted successfully',
      evaluation
    });
  } catch (err) {
    next(err);
  }
};

const getEvaluationByInterviewId = async (req, res, next) => {
  try {
    const evaluation = await evaluationService.getEvaluationByInterviewId(req.params.interviewId);
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found for this interview'
      });
    }

    res.json({
      success: true,
      evaluation
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitEvaluation,
  getEvaluationByInterviewId
};
