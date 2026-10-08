const dashboardService = require('../services/dashboardService');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    const payload = {
      ...stats,
      ...stats.metrics
    };
    res.json({
      success: true,
      stats: payload,
      data: payload
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};
