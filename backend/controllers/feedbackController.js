import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationService.js';
import { sendSuccess, sendError } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createFeedback = async (req, res) => {
  try {
    const { complaintId, rating, category, subject, message } = req.body;

    if (!isValidObjectId(complaintId)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    const feedback = await Feedback.create({
      citizenId: req.user.id,
      complaintId,
      rating,
      category,
      subject,
      message,
    });

    // Notify all Admins that new feedback has been received
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        role: 'admin',
        title: 'New Feedback Received',
        message: `Citizen submitted rating of ${rating}/5 for complaint: "${complaint.title}".`,
        type: 'Feedback',
        relatedComplaint: complaint._id
      });
    }

    return sendSuccess(res, 'Feedback created successfully.', feedback, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('complaintId citizenId', 'title name').sort({ createdAt: -1 });
    return sendSuccess(res, 'Feedbacks fetched successfully.', feedbacks);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid feedback id.', 400);
    const feedback = await Feedback.findById(req.params.id).populate('complaintId citizenId', 'title name');
    if (!feedback) return sendError(res, 'Feedback not found.', 404);
    return sendSuccess(res, 'Feedback fetched successfully.', feedback);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateFeedback = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid feedback id.', 400);
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feedback) return sendError(res, 'Feedback not found.', 404);
    return sendSuccess(res, 'Feedback updated successfully.', feedback);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid feedback id.', 400);
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return sendError(res, 'Feedback not found.', 404);
    return sendSuccess(res, 'Feedback deleted successfully.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
