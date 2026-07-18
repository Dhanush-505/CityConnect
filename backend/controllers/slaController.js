import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { computeSLAStatus } from '../utils/slaHelper.js';
import { createNotification } from '../utils/notificationService.js';
import recordAuditLog from '../utils/auditLogger.js';

const ESCALATION_ROLES = ['Field Worker', 'Senior Officer', 'Department Head', 'City Administrator'];

export const getSLAMetrics = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().populate('citizenId', 'name email').lean();

    let total = complaints.length;
    let breachedCount = 0;
    let nearBreachCount = 0;
    let onTrackCount = 0;
    let escalatedCount = 0;
    const departmentSLA = {};

    const enrichedComplaints = complaints.map((complaint) => {
      const sla = computeSLAStatus(complaint);
      const dept = complaint.department || 'Public Works';

      if (!departmentSLA[dept]) {
        departmentSLA[dept] = { total: 0, compliant: 0, breached: 0, percentage: 100 };
      }
      departmentSLA[dept].total += 1;

      if (['Resolved', 'Closed'].includes(complaint.status)) {
        departmentSLA[dept].compliant += 1;
        onTrackCount += 1;
      } else {
        if (sla.slaStatus === 'Breached') {
          breachedCount += 1;
          departmentSLA[dept].breached += 1;
        } else if (sla.slaStatus === 'Escalated') {
          escalatedCount += 1;
          departmentSLA[dept].breached += 1;
        } else if (sla.slaStatus === 'Near Breach') {
          nearBreachCount += 1;
          departmentSLA[dept].compliant += 1;
        } else {
          onTrackCount += 1;
          departmentSLA[dept].compliant += 1;
        }
      }

      return {
        ...complaint,
        slaMetrics: sla,
      };
    });

    Object.keys(departmentSLA).forEach((dept) => {
      const d = departmentSLA[dept];
      d.percentage = d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 100;
    });

    const compliantCount = onTrackCount + nearBreachCount;
    const overallCompliance = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

    return sendSuccess(res, 'SLA metrics retrieved successfully.', {
      overallCompliance,
      total,
      onTrackCount,
      nearBreachCount,
      breachedCount,
      escalatedCount,
      departmentSLA,
      complaints: enrichedComplaints,
    });
  } catch (error) {
    next(error);
  }
};

export const escalateComplaints = async (req, res, next) => {
  try {
    const now = new Date();
    // Find active complaints where deadline passed or manually requested
    const overdueComplaints = await Complaint.find({
      status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      $or: [
        { slaDeadline: { $lt: now } },
        { slaStatus: 'Breached' },
        { escalationLevel: { $gt: 0 } },
      ],
    });

    let count = 0;
    const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin', 'mayor', 'municipal_commissioner'] } }).select('_id');

    for (const complaint of overdueComplaints) {
      const currentLevel = complaint.escalationLevel || 0;
      if (currentLevel < 3) {
        const nextLevel = currentLevel + 1;
        const nextRole = ESCALATION_ROLES[nextLevel] || 'City Administrator';

        complaint.escalationLevel = nextLevel;
        complaint.slaStatus = 'Escalated';
        complaint.escalatedAt = now;
        complaint.escalationHistory.push({
          level: nextLevel,
          escalatedToRole: nextRole,
          reason: `Automatic SLA breach escalation (Level ${nextLevel})`,
          timestamp: now,
        });

        complaint.timeline.push({
          status: 'Escalated',
          updatedBy: 'SLA Escalation Engine',
          role: 'system',
          remarks: `Escalated to ${nextRole} due to SLA breach.`,
          timestamp: now,
          updatedAt: now,
        });

        await complaint.save();
        count += 1;

        // Notify admins / executives
        for (const admin of adminUsers) {
          await createNotification({
            userId: admin._id,
            role: 'admin',
            title: `CRITICAL SLA ESCALATION: ${complaint.complaintId}`,
            message: `Complaint "${complaint.title}" has been escalated to ${nextRole}.`,
            type: 'Complaint',
            relatedComplaint: complaint._id,
          });
        }
      }
    }

    recordAuditLog({
      req,
      action: 'SLA_ESCALATION_RUN',
      module: 'GOVERNANCE',
      details: { escalatedCount: count },
    });

    return sendSuccess(res, `SLA escalation processed. ${count} complaints escalated.`, {
      escalatedCount: count,
    });
  } catch (error) {
    next(error);
  }
};
