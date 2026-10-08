const { Notification, User } = require('../models');

async function getNotificationsForUser(userId) {
  return Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 20
  });
}

async function markAllNotificationsRead(userId) {
  await Notification.update(
    { isRead: true },
    { where: { userId, isRead: false } }
  );
  return { success: true };
}

async function markSingleNotificationRead(id, userId) {
  const notif = await Notification.findOne({ where: { id, userId } });
  if (notif) {
    notif.isRead = true;
    await notif.save();
  }
  return notif;
}

async function createNotification({ userId, title, message, type = 'INFO', link = null }) {
  return Notification.create({
    userId,
    title,
    message,
    type,
    link,
    isRead: false
  });
}

module.exports = {
  getNotificationsForUser,
  markAllNotificationsRead,
  markSingleNotificationRead,
  createNotification
};
