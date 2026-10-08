const notificationService = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getNotificationsForUser(req.user.id);
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
}

async function markSingleRead(req, res, next) {
  try {
    const notification = await notificationService.markSingleNotificationRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAllRead,
  markSingleRead
};
