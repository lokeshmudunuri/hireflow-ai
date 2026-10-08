const express = require('express');
const { body } = require('express-validator');
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', interviewController.getInterviews);
router.get('/:id', interviewController.getInterviewById);

router.post(
  '/',
  authorize('recruiter', 'admin'),
  [
    body('applicationId').isNumeric().withMessage('applicationId is required'),
    body('interviewerId').isNumeric().withMessage('interviewerId is required'),
    body('scheduledDate').notEmpty().withMessage('scheduledDate is required'),
    body('scheduledTime').notEmpty().withMessage('scheduledTime is required'),
    validate
  ],
  interviewController.scheduleInterview
);

router.patch('/:id/status', interviewController.updateInterviewStatus);

module.exports = router;
