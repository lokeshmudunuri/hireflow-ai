const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/interviewers', userController.getInterviewers);

router.get('/', authorize('admin'), userController.getUsers);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'recruiter', 'interviewer']).withMessage('Role must be admin, recruiter, or interviewer'),
    validate
  ],
  userController.createUser
);

router.patch('/:id/status', authorize('admin'), userController.toggleUserStatus);
router.patch(
  '/:id/role',
  authorize('admin'),
  [
    body('role').isIn(['admin', 'recruiter', 'interviewer']).withMessage('Role must be admin, recruiter, or interviewer'),
    validate
  ],
  userController.changeUserRole
);

module.exports = router;
