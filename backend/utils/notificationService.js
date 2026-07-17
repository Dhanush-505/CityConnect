import Notification from '../models/Notification.js';
import { emitToUser, emitToAll, emitToRole } from './socket.js';

/**
 * Creates, saves, and broadcasts a notification.
 * @param {Object} params
 * @param {string} params.userId - Recipient User ID
 * @param {string} params.role - Recipient Role (citizen, admin, field_worker)
 * @param {string} params.title - Notification Title
 * @param {string} params.message - Notification Message / Content
 * @param {string} params.type - Category (Complaint, Assignment, Announcement, Feedback, System)
 * @param {string} [params.relatedComplaint] - Optional Complaint ID
 */
export const createNotification = async ({
  userId,
  role,
  title,
  message,
  type = 'System',
  relatedComplaint = null
}) => {
  try {
    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
      type,
      relatedComplaint,
      isRead: false
    });

    // Populate schema/response or just fetch document
    const notificationData = notification.toObject();

    // Dispatch real-time socket event to the target user
    emitToUser(userId, 'notification', notificationData);

    return notification;
  } catch (error) {
    console.error('Failed to create/dispatch notification:', error);
    return null;
  }
};

/**
 * Dispatches a status sync trigger globally so client dashboards update in real-time without page refresh.
 */
export const syncDashboard = (complaintId, status) => {
  emitToAll('dashboard_sync', { complaintId, status });
};
