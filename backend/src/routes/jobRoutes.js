const express = require('express');
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

router.post(
  '/',
  authorize('recruiter', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    validate
  ],
  jobController.createJob
);

router.put('/:id', authorize('recruiter', 'admin'), jobController.updateJob);
router.patch('/:id/close', authorize('recruiter', 'admin'), jobController.closeJob);
router.patch('/:id/reopen', authorize('recruiter', 'admin'), jobController.reopenJob);

module.exports = router;
