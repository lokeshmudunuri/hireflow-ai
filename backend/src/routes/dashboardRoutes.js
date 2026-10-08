const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', authorize('recruiter', 'admin'), dashboardController.getDashboardStats);
router.get('/stats', authorize('recruiter', 'admin'), dashboardController.getDashboardStats);

module.exports = router;
