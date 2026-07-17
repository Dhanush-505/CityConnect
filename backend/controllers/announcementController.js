import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitToAll } from '../utils/socket.js';
import { sendSuccess, sendError } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createAnnouncement = async (req, res) => {
  try {
    const { title, description, audience, department, expiryDate, priority = 'Medium' } = req.body;
    
    const announcement = await Announcement.create({
      title,
      description,
      audience,
      department,
      expiryDate,
      priority,
      publishedBy: req.user.id,
      status: 'Published'
    });

    // Determine target users to create user-specific Notification history logs
    let query = {};
    if (audience === 'All Citizens') {
      query = { role: 'citizen' };
    } else if (audience === 'Field Workers') {
      query = { role: 'field_worker' };
    } else if (audience === 'Everyone') {
      query = { role: { $in: ['citizen', 'field_worker', 'admin'] } };
    } else {
      // Department specific users (Electricity Users, Water Supply Users, Drainage Users)
      query = { role: 'citizen' };
    }

    const targetUsers = await User.find(query).select('_id role');
    
    if (targetUsers.length > 0) {
      const notifications = targetUsers.map((user) => ({
        userId: user._id,
        role: user.role,
        title: `Announcement: ${title}`,
        message: description,
        type: 'Announcement',
        isRead: false
      }));
      await Notification.insertMany(notifications);
    }

    // Broadcast announcement via Socket.IO
    emitToAll('announcement_published', {
      _id: announcement._id,
      title,
      description,
      audience,
      priority,
      publishedDate: announcement.createdAt
    });

    return sendSuccess(res, 'Announcement created and published successfully.', announcement, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('publishedBy', 'name email')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Announcements fetched successfully.', announcements);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid announcement id.', 400);
    const announcement = await Announcement.findById(req.params.id).populate('publishedBy', 'name email');
    if (!announcement) return sendError(res, 'Announcement not found.', 404);
    return sendSuccess(res, 'Announcement fetched successfully.', announcement);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid announcement id.', 400);
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) return sendError(res, 'Announcement not found.', 404);
    return sendSuccess(res, 'Announcement updated successfully.', announcement);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid announcement id.', 400);
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return sendError(res, 'Announcement not found.', 404);
    return sendSuccess(res, 'Announcement deleted successfully.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
