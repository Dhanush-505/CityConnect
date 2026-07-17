import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create Notification (Admin / System Triggered)
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      isRead: false
    });
    return sendSuccess(res, 'Notification created successfully.', notification, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Fetch notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Notifications fetched successfully.', notifications);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Fetch single notification by ID (with ownership check)
export const getNotificationById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid notification id.', 400);
    const notification = await Notification.findById(req.params.id);
    if (!notification) return sendError(res, 'Notification not found.', 404);

    // Ownership check
    if (String(notification.userId) !== req.user.id) {
      return sendError(res, 'Unauthorized to view this notification.', 403);
    }

    return sendSuccess(res, 'Notification fetched successfully.', notification);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Mark single notification as read
export const markNotificationRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid notification id.', 400);
    const notification = await Notification.findById(req.params.id);
    if (!notification) return sendError(res, 'Notification not found.', 404);

    // Ownership check
    if (String(notification.userId) !== req.user.id) {
      return sendError(res, 'Unauthorized to modify this notification.', 403);
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 'Notification marked as read.', notification);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Mark all user's notifications as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true } });
    return sendSuccess(res, 'All notifications marked as read.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Delete single notification (with ownership check)
export const deleteNotification = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid notification id.', 400);
    const notification = await Notification.findById(req.params.id);
    if (!notification) return sendError(res, 'Notification not found.', 404);

    // Ownership check
    if (String(notification.userId) !== req.user.id) {
      return sendError(res, 'Unauthorized to delete this notification.', 403);
    }

    await Notification.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'Notification deleted successfully.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Delete all read notifications for user
export const deleteReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id, isRead: true });
    return sendSuccess(res, 'Read notifications cleared successfully.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
