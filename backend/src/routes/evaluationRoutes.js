const express = require('express');
const { body } = require('express-validator');
const evaluationController = require('../controllers/evaluationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('interviewer', 'admin'),
  [
    body('interviewId').isNumeric().withMessage('interviewId is required'),
    body('technicalSkillsScore').isFloat({ min: 1, max: 10 }).withMessage('technicalSkillsScore must be between 1 and 10'),
    body('problemSolvingScore').isFloat({ min: 1, max: 10 }).withMessage('problemSolvingScore must be between 1 and 10'),
    body('communicationScore').isFloat({ min: 1, max: 10 }).withMessage('communicationScore must be between 1 and 10'),
    body('projectKnowledgeScore').isFloat({ min: 1, max: 10 }).withMessage('projectKnowledgeScore must be between 1 and 10'),
    body('roleFitScore').isFloat({ min: 1, max: 10 }).withMessage('roleFitScore must be between 1 and 10'),
    body('recommendation').isIn(['Strong Hire', 'Hire', 'Hold', 'Reject']).withMessage('Invalid recommendation'),
    body('comments').trim().notEmpty().withMessage('Evaluation comments are required'),
    validate
  ],
  evaluationController.submitEvaluation
);

router.get('/interview/:interviewId', evaluationController.getEvaluationByInterviewId);

module.exports = router;
