const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { rateLimit } = require('../middleware/rateLimiter');

const router = express.Router();

// Sensitive authentication rate limiter (30 requests per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Valid corporate email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters in length'),
    validate
  ],
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid corporate email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid corporate email is required'),
    validate
  ],
  authController.forgotPassword
);

router.get('/me', protect, authController.getMe);

module.exports = router;
