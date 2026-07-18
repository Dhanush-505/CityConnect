import EmergencyIncident from '../models/EmergencyIncident.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createNotification } from '../utils/notificationService.js';
import recordAuditLog from '../utils/auditLogger.js';

export const reportEmergency = async (req, res, next) => {
  try {
    const { title, type, location, latitude, longitude, description, assignedDepartment } = req.body;

    if (!title || !type || !location || !description) {
      return sendError(res, 'Title, type, location, and description are required for emergency reporting.', 400);
    }

    const reporter = await User.findById(req.user.id);

    const emergency = await EmergencyIncident.create({
      title,
      type,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      description,
      reportedBy: req.user.id,
      reporterName: reporter?.name || 'Citizen',
      reporterPhone: reporter?.phone || '',
      assignedDepartment: assignedDepartment || 'Emergency Services',
      severity: 'Critical',
      status: 'Active',
      executiveAlerted: true,
    });

    // Also automatically register high-priority complaint linked to this emergency
    await Complaint.create({
      citizenId: req.user.id,
      citizenName: reporter?.name || 'Citizen',
      citizenPhone: reporter?.phone || '',
      title: `[EMERGENCY - ${type}] ${title}`,
      description: `EMERGENCY ALERT: ${description}`,
      department: assignedDepartment || 'Emergency Services',
      category: 'Emergency',
      priority: 'Critical',
      status: 'Submitted',
      isEmergency: true,
      emergencyType: type,
      complaintLocation: location,
      latitude: latitude || null,
      longitude: longitude || null,
    });

    // Executive Alerts
    const executives = await User.find({
      role: { $in: ['admin', 'super_admin', 'mayor', 'municipal_commissioner', 'executive'] },
    }).select('_id');

    for (const exec of executives) {
      await createNotification({
        userId: exec._id,
        role: 'admin',
        title: `🚨 EMERGENCY ALERT: ${type}`,
        message: `Emergency reported at ${location}: ${title}`,
        type: 'Emergency',
        relatedComplaint: null,
      });
    }

    recordAuditLog({
      req,
      action: 'REPORT_EMERGENCY',
      module: 'GOVERNANCE',
      details: { incidentId: emergency.incidentId, type, location },
    });

    return sendSuccess(res, 'Emergency incident reported! Executive teams notified immediately.', emergency, 201);
  } catch (error) {
    next(error);
  }
};

export const getEmergencyIncidents = async (req, res, next) => {
  try {
    const incidents = await EmergencyIncident.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, 'Emergency incidents fetched successfully.', incidents);
  } catch (error) {
    next(error);
  }
};
