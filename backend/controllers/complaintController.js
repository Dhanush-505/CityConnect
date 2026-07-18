import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { calculateProgress } from '../utils/workflowEngine.js';
import { createNotification, syncDashboard } from '../utils/notificationService.js';
import recordAuditLog from '../utils/auditLogger.js';
import { calculateSLADeadline } from '../utils/slaHelper.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (['submitted', 'pending', 'open', 'new', 'under review', 'approved'].includes(value)) return 'Pending';
  if (['in progress', 'in-progress', 'working', 'assigned', 'accepted', 'travelling', 'work started', 'completed', 'waiting verification'].includes(value)) return 'In Progress';
  if (['resolved', 'complete', 'closed'].includes(value)) return 'Resolved';
  if (['rejected', 'cancelled', 'canceled'].includes(value)) return 'Rejected';
  return 'Pending';
};

const mapDepartment = (category = '') => {
  const value = String(category || '').trim().toLowerCase();
  if (['roads', 'road', 'potholes', 'street'].includes(value)) return 'Public Works';
  if (['street lights', 'light', 'lighting', 'electricity', 'electrical'].includes(value)) return 'Electrical';
  if (['drainage', 'water logging', 'sewage', 'waste'].includes(value)) return 'Drainage';
  return 'Public Works';
};

const serializeComplaint = (complaint) => ({
  _id: complaint._id,
  id: complaint._id,
  complaintId: complaint.complaintId,
  citizenId: complaint.citizenId,
  citizenName: complaint.citizenName,
  citizenPhone: complaint.citizenPhone,
  title: complaint.title,
  description: complaint.description,
  category: complaint.category,
  department: complaint.department || mapDepartment(complaint.category),
  latitude: complaint.latitude,
  longitude: complaint.longitude,
  complaintLocation: complaint.complaintLocation,
  landmark: complaint.landmark,
  location: complaint.complaintLocation || complaint.landmark || `${complaint.latitude || ''}, ${complaint.longitude || ''}`.trim(),
  complaintImages: complaint.complaintImages || complaint.images || [],
  images: complaint.complaintImages || complaint.images || [],
  priority: complaint.priority || 'Medium',
  status: complaint.status || 'Submitted',
  normalizedStatus: normalizeStatus(complaint.status),
  progress: calculateProgress(complaint.status),
  contactNumber: complaint.contactNumber,
  createdAt: complaint.createdAt,
  updatedAt: complaint.updatedAt,
  date: complaint.createdAt,
  assignedFieldWorker: complaint.assignedFieldWorker,
  adminRemarks: complaint.adminRemarks,
  citizenRemarks: complaint.citizenRemarks,
});

export const createComplaint = async (req, res, next) => {
  try {
    let complaintImages = [];
    if (req.body.complaintImages) {
      try {
        complaintImages = typeof req.body.complaintImages === 'string'
          ? JSON.parse(req.body.complaintImages)
          : req.body.complaintImages;
      } catch (e) {
        complaintImages = [];
      }
    } else {
      const files = Array.isArray(req.files) ? req.files : [];
      complaintImages = files.map((file) => ({
        publicId: `uploads/complaints/${file.filename}`,
        url: `/uploads/complaints/${file.filename}`,
        uploadedBy: req.user?.id || 'citizen',
        uploadedAt: new Date()
      }));
    }

    const citizen = await User.findById(req.user.id);
    const initialStatus = req.body.status || 'Submitted';
    const priority = req.body.priority || 'Medium';
    const { deadline: slaDeadline, hours: slaHours } = calculateSLADeadline(new Date(), priority);

    const complaint = await Complaint.create({
      citizenId: req.user.id,
      citizenName: req.body.citizenName || citizen?.name || 'Citizen',
      citizenPhone: req.body.citizenPhone || citizen?.phone || '',
      title: req.body.title,
      description: req.body.description,
      department: req.body.department || mapDepartment(req.body.category),
      category: req.body.category,
      priority,
      status: initialStatus,
      slaDeadline,
      slaHours,
      complaintImages: complaintImages,
      complaintLocation: req.body.address || req.body.complaintLocation || req.body.landmark || '',
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null,
      location: {
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        address: req.body.address || req.body.complaintLocation || '',
        city: req.body.city || '',
        state: req.body.state || '',
        country: req.body.country || '',
        pincode: req.body.pincode || '',
        landmark: req.body.landmark || ''
      },
      assignedFieldWorker: req.body.assignedFieldWorker || null,
      adminRemarks: req.body.adminRemarks || '',
      citizenRemarks: req.body.citizenRemarks || '',
      contactNumber: req.body.contactNumber || citizen?.phone || '',
      timeline: [{
        status: initialStatus,
        updatedBy: req.body.citizenName || citizen?.name || 'Citizen',
        role: 'citizen',
        remarks: 'Complaint submitted by citizen',
        image: complaintImages[0]?.url || '',
        timestamp: new Date(),
        updatedAt: new Date()
      }]
    });

    // Send notifications to all admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        role: 'admin',
        title: 'New Complaint Registered',
        message: `A new complaint titled "${complaint.title}" has been submitted.`,
        type: 'Complaint',
        relatedComplaint: complaint._id
      });
    }

    // Citizen notification
    await createNotification({
      userId: req.user.id,
      role: 'citizen',
      title: 'Complaint Registered',
      message: `Your complaint "${complaint.title}" has been successfully filed.`,
      type: 'Complaint',
      relatedComplaint: complaint._id
    });

    // Real-time synchronization
    syncDashboard(complaint._id, 'Submitted');

    recordAuditLog({
      req,
      action: 'RAISE_COMPLAINT',
      module: 'COMPLAINT',
      details: { complaintId: complaint.complaintId, title: complaint.title, department: complaint.department }
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: {
        id: complaint.complaintId,
        _id: complaint._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaintsByCitizen = async (req, res, next) => {
  try {
    const hasPagination = req.query.page || req.query.limit;

    if (hasPagination) {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 6);
      const skip = (page - 1) * limit;

      const totalItems = await Complaint.countDocuments({ citizenId: req.user.id });
      const complaints = await Complaint.find({ citizenId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      res.json({
        success: true,
        message: 'Complaints fetched successfully.',
        data: {
          items: complaints.map(serializeComplaint),
          totalPages: Math.max(1, Math.ceil(totalItems / limit)),
          totalItems,
        },
      });
      return;
    }

    const complaints = await Complaint.find({ citizenId: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, message: 'Complaints fetched successfully.', data: complaints.map(serializeComplaint) });
  } catch (error) {
    next(error);
  }
};

export const getComplaintStatsByCitizen = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user.id }).lean();
    const totals = {
      total: complaints.length,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    };

    complaints.forEach((complaint) => {
      const status = normalizeStatus(complaint.status);
      if (status === 'Pending') totals.pending += 1;
      if (status === 'In Progress') totals.inProgress += 1;
      if (status === 'Resolved') totals.resolved += 1;
      if (status === 'Rejected') totals.rejected += 1;
    });

    res.json({
      success: true,
      message: 'Complaint stats fetched successfully.',
      data: {
        totals,
        categories: {
          Roads: 0,
          Electricity: 0,
          Drainage: 0,
          Water: 0,
          Garbage: 0,
          'Street Lights': 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, citizenId: req.user.id });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (normalizeStatus(complaint.status) !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending complaints can be deleted.' });
    }

    await Complaint.deleteOne({ _id: req.params.id, citizenId: req.user.id });
    res.json({ success: true, message: 'Complaint deleted successfully.', data: {} });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res) => {
  try {
    const query = {};

    if (req.query.department) query.department = req.query.department;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.status) query.status = req.query.status;
    if (req.query.citizen) {
      const user = await User.findOne({ name: { $regex: req.query.citizen, $options: 'i' } });
      if (user) query.citizenId = user._id;
    }
    if (req.query.date) {
      const start = new Date(req.query.date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    const complaints = await Complaint.find(query).populate('citizenId', 'name email').sort({ createdAt: -1 });
    return sendSuccess(res, 'Complaints fetched successfully.', complaints);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getComplaintById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id).populate('citizenId', 'name email');
    if (!complaint) return sendError(res, 'Complaint not found.', 404);
    return sendSuccess(res, 'Complaint fetched successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateComplaint = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!complaint) return sendError(res, 'Complaint not found.', 404);
    return sendSuccess(res, 'Complaint updated successfully.', complaint);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteComplaintById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);
    return sendSuccess(res, 'Complaint deleted successfully.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const searchComplaints = async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const complaints = await Complaint.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { complaintId: { $regex: searchTerm, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    return sendSuccess(res, 'Complaints search completed.', complaints);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getComplaintTimeline = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);
    return sendSuccess(res, 'Timeline fetched successfully.', complaint.timeline || []);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateComplaintLocation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid complaint id.', 400);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, 'Complaint not found.', 404);

    // Citizen can edit location BEFORE approval (Submitted or Under Review status)
    if (req.user.role !== 'admin' && String(complaint.citizenId) !== req.user.id) {
      return sendError(res, 'Unauthorized to update this complaint.', 403);
    }

    if (['Submitted', 'Under Review'].includes(complaint.status)) {
      const { latitude, longitude, address, city, state, country, pincode, landmark } = req.body;
      
      complaint.latitude = latitude || complaint.latitude;
      complaint.longitude = longitude || complaint.longitude;
      complaint.complaintLocation = address || complaint.complaintLocation;
      complaint.landmark = landmark || complaint.landmark;

      complaint.location = {
        latitude: latitude !== undefined ? latitude : complaint.location.latitude,
        longitude: longitude !== undefined ? longitude : complaint.location.longitude,
        address: address !== undefined ? address : complaint.location.address,
        city: city !== undefined ? city : complaint.location.city,
        state: state !== undefined ? state : complaint.location.state,
        country: country !== undefined ? country : complaint.location.country,
        pincode: pincode !== undefined ? pincode : complaint.location.pincode,
        landmark: landmark !== undefined ? landmark : complaint.location.landmark
      };

      await complaint.save();
      return sendSuccess(res, 'Complaint location updated successfully.', complaint);
    } else {
      return sendError(res, 'Cannot modify location after complaint approval.', 400);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

