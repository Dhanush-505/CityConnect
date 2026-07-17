import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { isValidTransition } from '../utils/workflowEngine.js';
import { createNotification, syncDashboard } from '../utils/notificationService.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const addTimelineEntry = (complaint, status, updatedBy, role = 'admin', remarks = '', image = '') => {
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

export const getAdminComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('citizenId', 'name email phone')
      .populate('assignedFieldWorker', 'name email department employeeId')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 'Complaints fetched successfully.', complaints);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const approveComplaint = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    const nextStatus = 'Approved';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.status = nextStatus;
    addTimelineEntry(complaint, complaint.status, req.user?.name || 'Admin', 'admin', 'Approved by admin');
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Complaint Approved',
      message: `Your complaint ${complaint.complaintId} has been approved.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Complaint approved successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const rejectComplaint = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    const nextStatus = 'Rejected';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.status = nextStatus;
    complaint.adminRemarks = req.body.reason || 'Rejected by admin';
    addTimelineEntry(complaint, complaint.status, req.user?.name || 'Admin', 'admin', complaint.adminRemarks);
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Complaint Rejected',
      message: `Your complaint ${complaint.complaintId} was rejected.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Complaint rejected successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const assignComplaint = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const workerId = req.body.workerId;
    if (!workerId || !isValidObjectId(workerId)) return sendError(res, 'Invalid field worker id.', 400);
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'field_worker') return sendError(res, 'Field worker not found.', 404);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    const nextStatus = 'Assigned';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.assignedFieldWorker = worker._id;
    complaint.status = nextStatus;
    complaint.department = worker.department || complaint.department;
    if (req.body.remarks) complaint.adminRemarks = req.body.remarks;
    if (req.body.expectedCompletionDate) {
      complaint.expectedCompletionDate = new Date(req.body.expectedCompletionDate);
    }

    addTimelineEntry(complaint, complaint.status, req.user?.name || 'Admin', 'admin', req.body.remarks || 'Assigned to field worker');
    await complaint.save();

    await createNotification({
      userId: worker._id,
      role: 'field_worker',
      title: 'New Task Assigned',
      message: `You have been assigned task ${complaint.complaintId}.`,
      type: 'Assignment',
      relatedComplaint: complaint._id
    });

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Field Officer Assigned',
      message: `A field officer has been assigned to your complaint ${complaint.complaintId}.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Complaint assigned successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    const nextStatus = req.body.status;
    if (!nextStatus) return sendError(res, 'Status is required.', 400);

    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.status = nextStatus;
    complaint.adminRemarks = req.body.remarks || complaint.adminRemarks;
    addTimelineEntry(complaint, complaint.status, req.user?.name || 'Admin', 'admin', req.body.remarks || `Status updated to ${nextStatus}`);
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Complaint Status Updated',
      message: `Complaint ${complaint.complaintId} status updated to ${nextStatus}.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Complaint status updated successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateComplaintPriority = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);
    complaint.priority = req.body.priority || complaint.priority;
    addTimelineEntry(complaint, complaint.status, req.user?.name || 'Admin', 'admin', `Priority updated to ${complaint.priority}`);
    await complaint.save();
    return sendSuccess(res, 'Complaint priority updated successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const verifyCompletion = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    if (complaint.status !== 'Waiting Verification') {
      return sendError(res, 'Complaint is not in Waiting Verification status.', 400);
    }

    const { approved, remarks } = req.body;
    if (approved === undefined) {
      return sendError(res, 'Field "approved" is required.', 400);
    }

    const nextStatus = approved ? 'Closed' : 'In Progress';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.status = nextStatus;
    if (remarks) complaint.adminRemarks = remarks;
    if (approved) {
      complaint.closedDate = new Date();
    }

    addTimelineEntry(complaint, nextStatus, req.user?.name || 'Admin', 'admin', remarks || (approved ? 'Resolution approved by Admin' : 'Resolution rejected by Admin'));
    await complaint.save();

    if (approved) {
      await createNotification({
        userId: complaint.citizenId,
        role: 'citizen',
        title: 'Complaint Closed',
        message: `Your complaint ${complaint.complaintId} has been closed.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    } else {
      if (complaint.assignedFieldWorker) {
        await createNotification({
          userId: complaint.assignedFieldWorker,
          role: 'field_worker',
          title: 'Complaint Reopened',
          message: `The resolution for complaint ${complaint.complaintId} was rejected by Admin. Please resume work.`,
          type: 'Complaint',
          relatedComplaint: complaint._id
        });
      }
      await createNotification({
        userId: complaint.citizenId,
        role: 'citizen',
        title: 'Work Resumed',
        message: `The resolution for complaint ${complaint.complaintId} was rejected. Work is back in progress.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    }

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, `Verification complete. Status updated to ${nextStatus}.`, complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const reopenComplaint = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    if (complaint.status !== 'Closed' && complaint.status !== 'Rejected') {
      return sendError(res, 'Only Closed or Rejected complaints can be reopened.', 400);
    }

    const nextStatus = 'Under Review';
    if (!isValidTransition(complaint.status, nextStatus)) {
      return sendError(res, `Invalid status transition from ${complaint.status} to ${nextStatus}.`, 400);
    }

    complaint.status = nextStatus;
    const remarks = req.body.remarks || 'Complaint reopened by Admin';
    if (remarks) complaint.adminRemarks = remarks;

    addTimelineEntry(complaint, nextStatus, req.user?.name || 'Admin', 'admin', remarks);
    await complaint.save();

    await createNotification({
      userId: complaint.citizenId,
      role: 'citizen',
      title: 'Complaint Reopened',
      message: `Your complaint ${complaint.complaintId} has been reopened.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    if (complaint.assignedFieldWorker) {
      await createNotification({
        userId: complaint.assignedFieldWorker,
        role: 'field_worker',
        title: 'Complaint Reopened',
        message: `Complaint ${complaint.complaintId} assigned to you has been reopened.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    }

    syncDashboard(complaint._id, complaint.status);

    return sendSuccess(res, 'Complaint reopened successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
