import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isValidTransition } from '../utils/workflowEngine.js';
import { createNotification, syncDashboard } from '../utils/notificationService.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const addTimelineEntry = (complaint, status, updatedBy, role = 'field_worker', remarks = '', image = '') => {
  complaint.timeline = complaint.timeline || [];
  complaint.timeline.push({
    status,
    updatedBy,
    role,
    remarks,
    image,
    timestamp: new Date(),
    updatedAt: new Date()
  });
};

export const getWorkerTasks = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedFieldWorker: req.user.id })
      .populate('citizenId', 'name email phone')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Assigned tasks fetched successfully.', complaints);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getWorkerTaskById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findOne({ _id: req.params.id, assignedFieldWorker: req.user.id })
      .populate('citizenId', 'name email phone');
    if (!complaint) return sendError(res, 'Task not found.', 404);
    return sendSuccess(res, 'Task fetched successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const acceptTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findOne({ _id: req.params.id, assignedFieldWorker: req.user.id });
    if (!complaint) return sendError(res, 'Task not found.', 404);

    const nextStatus = 'Accepted';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.status = nextStatus;
    addTimelineEntry(complaint, nextStatus, req.user?.name || 'Field Worker', 'field_worker', 'Accepted the assigned task');
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Task Accepted',
      message: `Worker ${req.user.name} accepted your complaint ${complaint.complaintId}.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        role: 'admin',
        title: 'Task Accepted',
        message: `Worker ${req.user.name} accepted complaint ${complaint.complaintId}.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    }

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Task accepted successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateTaskProgress = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findOne({ _id: req.params.id, assignedFieldWorker: req.user.id });
    if (!complaint) return sendError(res, 'Task not found.', 404);

    const { status, remarks } = req.body;
    let progressImages = [];
    if (req.body.progressImages) {
      try {
        progressImages = typeof req.body.progressImages === 'string'
          ? JSON.parse(req.body.progressImages)
          : req.body.progressImages;
      } catch (e) {
        progressImages = [];
      }
    } else {
      const file = req.file || (req.files && req.files[0]);
      if (file) {
        progressImages = [{
          publicId: `uploads/progress/${file.filename}`,
          url: `/uploads/${file.filename}`,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        }];
      }
    }

    const nextStatus = status || complaint.status;

    if (nextStatus !== complaint.status) {
      if (!isValidTransition(complaint.status, nextStatus)) {
        return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
      }
      complaint.status = nextStatus;
    }

    if (progressImages.length > 0) {
      complaint.progressImages = (complaint.progressImages || []).concat(progressImages);
    }

    addTimelineEntry(
      complaint,
      nextStatus,
      req.user?.name || 'Field Worker',
      'field_worker',
      remarks || `Progress updated to ${nextStatus}`,
      progressImages[0]?.url || req.body.image || ''
    );
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Task Updated',
      message: `Worker ${req.user.name} updated status to ${nextStatus} for complaint ${complaint.complaintId}.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        role: 'admin',
        title: 'Task Progress Updated',
        message: `Worker ${req.user.name} updated progress to ${nextStatus} for complaint ${complaint.complaintId}.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    }

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Task progress updated successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const completeTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findOne({ _id: req.params.id, assignedFieldWorker: req.user.id });
    if (!complaint) return sendError(res, 'Task not found.', 404);

    const nextStatus = 'Waiting Verification';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    const { remarks } = req.body;
    let completionImages = [];
    if (req.body.completionImages) {
      try {
        completionImages = typeof req.body.completionImages === 'string'
          ? JSON.parse(req.body.completionImages)
          : req.body.completionImages;
      } catch (e) {
        completionImages = [];
      }
    } else {
      const file = req.file || (req.files && req.files[0]);
      if (file) {
        completionImages = [{
          publicId: `uploads/completion/${file.filename}`,
          url: `/uploads/${file.filename}`,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        }];
      }
    }

    complaint.status = nextStatus;
    complaint.resolvedDate = new Date();

    if (completionImages.length > 0) {
      complaint.completionImages = (complaint.completionImages || []).concat(completionImages);
    }
    
    // Add timeline entry
    addTimelineEntry(
      complaint,
      nextStatus,
      req.user?.name || 'Field Worker',
      'field_worker',
      remarks || 'Work completed, waiting for verification',
      completionImages[0]?.url || req.body.image || ''
    );
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Work Completed',
      message: `Your complaint ${complaint.complaintId} has been completed and is waiting verification.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        role: 'admin',
        title: 'Task Completed',
        message: `Worker ${req.user.name} marked complaint ${complaint.complaintId} as completed.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    }

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Task completed successfully. Waiting for admin verification.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
