const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const decisionController = require('../controllers/decisionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', authorize('recruiter', 'admin'), applicationController.getApplications);
router.get('/:id', applicationController.getApplicationById);

router.post(
  '/',
  authorize('recruiter', 'admin'),
  [
    body('jobId').isInt().withMessage('Valid jobId is required'),
    body('candidateId').isInt().withMessage('Valid candidateId is required'),
    validate
  ],
  applicationController.createApplication
);

// Application Validation
router.post(
  '/:id/validate',
  authorize('recruiter', 'admin'),
  applicationController.validateApplication
);

// Recalculate score
router.post(
  '/:id/recalculate-score',
  authorize('recruiter', 'admin'),
  applicationController.recalculateScore
);

// Application State Machine Status Transition
router.patch(
  '/:id/status',
  authorize('recruiter', 'admin'),
  [
    body('status').notEmpty().withMessage('Target status is required'),
    validate
  ],
  applicationController.updateStatus
);

// Bulk Status Transition
router.post(
  '/bulk-status',
  authorize('recruiter', 'admin'),
  [
    body('applicationIds').isArray({ min: 1 }).withMessage('applicationIds array is required'),
    body('targetStatus').notEmpty().withMessage('targetStatus is required'),
    validate
  ],
  applicationController.bulkUpdateStatus
);

// Final Hiring Decision
router.post(
  '/:applicationId/decision',
  authorize('recruiter', 'admin'),
  [
    body('decision').isIn(['SELECTED', 'REJECTED', 'HOLD']).withMessage('Decision must be SELECTED, REJECTED, or HOLD'),
    validate
  ],
  decisionController.makeFinalDecision
);

module.exports = router;
