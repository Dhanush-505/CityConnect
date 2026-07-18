import Complaint from '../models/Complaint.js';
import { sendSuccess } from '../utils/response.js';
import { getCityPerformanceIndex } from './governanceController.js';

export const getPublicDashboardData = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();

    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

    const deptMap = {};
    complaints.forEach((c) => {
      const dept = c.department || 'Public Works';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, total: 0, resolved: 0 };
      }
      deptMap[dept].total += 1;
      if (['Resolved', 'Closed'].includes(c.status)) deptMap[dept].resolved += 1;
    });

    const departmentPerformance = Object.values(deptMap).map((d) => ({
      department: d.department,
      total: d.total,
      resolved: d.resolved,
      resolutionRate: d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 100,
    }));

    // Anonymized recent active public issues
    const activePublicIssues = complaints
      .filter((c) => !['Resolved', 'Closed', 'Rejected'].includes(c.status))
      .slice(0, 10)
      .map((c) => ({
        id: c._id,
        complaintId: c.complaintId,
        title: c.title,
        category: c.category,
        department: c.department,
        status: c.status,
        priority: c.priority,
        location: c.complaintLocation || 'City Center',
        votesCount: c.votesCount || 0,
        createdAt: c.createdAt,
      }));

    const cityIndex = await getCityPerformanceIndex();

    return sendSuccess(res, 'Public transparency statistics retrieved successfully.', {
      totalComplaints,
      resolvedComplaints,
      resolutionRate,
      cityIndexScore: cityIndex.score,
      cityIndexStatus: cityIndex.status,
      departmentPerformance,
      activePublicIssues,
    });
  } catch (error) {
    next(error);
  }
};
