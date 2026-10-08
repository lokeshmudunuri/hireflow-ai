const express = require('express');
const { body } = require('express-validator');
const candidateController = require('../controllers/candidateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', candidateController.getCandidates);
router.get('/:id', candidateController.getCandidateById);

router.post(
  '/',
  authorize('recruiter', 'admin'),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validate
  ],
  candidateController.createCandidate
);

router.post(
  '/:id/notes',
  authorize('recruiter', 'admin'),
  [
    body('note').trim().notEmpty().withMessage('Note content cannot be empty'),
    validate
  ],
  candidateController.addCandidateNote
);

module.exports = router;
