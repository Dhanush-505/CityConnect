import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import Department from '../models/Department.js';
import EmergencyIncident from '../models/EmergencyIncident.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { computeSLAStatus } from '../utils/slaHelper.js';

export const getCityPerformanceIndex = async () => {
  const complaints = await Complaint.find().lean();
  const feedbacks = await Feedback.find().lean();
  const emergencies = await EmergencyIncident.find().lean();

  const totalComplaints = complaints.length;
  if (totalComplaints === 0) {
    return { score: 100, status: 'Excellent', breakdown: { resolution: 100, sla: 100, feedback: 100, emergency: 100 } };
  }

  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
  const resolutionRate = Math.round((resolved / totalComplaints) * 100);

  const slaMetrics = complaints.map((c) => computeSLAStatus(c));
  const compliantCount = slaMetrics.filter((s) => s.slaPercentage >= 70).length;
  const slaComplianceRate = Math.round((compliantCount / totalComplaints) * 100);

  let avgFeedbackRating = 4.2;
  if (feedbacks.length > 0) {
    const totalRating = feedbacks.reduce((acc, f) => acc + (f.rating || 4), 0);
    avgFeedbackRating = totalRating / feedbacks.length;
  }
  const feedbackScore = Math.round((avgFeedbackRating / 5) * 100);

  const resolvedEmergencies = emergencies.filter((e) => e.status === 'Resolved').length;
  const emergencyResponseRate = emergencies.length > 0 ? Math.round((resolvedEmergencies / emergencies.length) * 100) : 95;

  const overallScore = Math.round(
    resolutionRate * 0.35 +
    slaComplianceRate * 0.30 +
    feedbackScore * 0.20 +
    emergencyResponseRate * 0.15
  );

  let status = 'Satisfactory';
  if (overallScore >= 90) status = 'Excellent';
  else if (overallScore >= 75) status = 'Good';
  else if (overallScore >= 60) status = 'Average';
  else status = 'Needs Improvement';

  return {
    score: overallScore,
    status,
    breakdown: {
      resolutionRate,
      slaComplianceRate,
      feedbackScore,
      emergencyResponseRate,
    },
  };
};

export const getExecutiveDashboard = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();
    const totalComplaints = complaints.length;
    const activeComplaints = complaints.filter((c) => !['Resolved', 'Closed', 'Rejected'].includes(c.status)).length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const resolvedToday = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status) && new Date(c.updatedAt) >= todayStart).length;

    const index = await getCityPerformanceIndex();

    // Department Performance & Grading
    const deptMap = {};
    complaints.forEach((c) => {
      const d = c.department || 'Public Works';
      if (!deptMap[d]) {
        deptMap[d] = { name: d, total: 0, resolved: 0, pending: 0, escalated: 0, slaScores: [] };
      }
      deptMap[d].total += 1;
      if (['Resolved', 'Closed'].includes(c.status)) deptMap[d].resolved += 1;
      else deptMap[d].pending += 1;

      if (c.escalationLevel > 0 || c.slaStatus === 'Breached') deptMap[d].escalated += 1;

      const sla = computeSLAStatus(c);
      deptMap[d].slaScores.push(sla.slaPercentage);
    });

    const departmentScorecards = Object.values(deptMap).map((d) => {
      const resolutionRate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 100;
      const avgSla = d.slaScores.length > 0 ? Math.round(d.slaScores.reduce((a, b) => a + b, 0) / d.slaScores.length) : 100;
      const score = Math.round(resolutionRate * 0.6 + avgSla * 0.4);

      let grade = 'C';
      if (score >= 90) grade = 'A+';
      else if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else grade = 'D';

      return {
        department: d.name,
        totalComplaints: d.total,
        resolved: d.resolved,
        pending: d.pending,
        escalated: d.escalated,
        resolutionRate,
        slaCompliance: avgSla,
        performanceScore: score,
        grade,
      };
    }).sort((a, b) => b.performanceScore - a.performanceScore);

    const activeEmergencies = await EmergencyIncident.countDocuments({ status: { $ne: 'Resolved' } });

    // AI Executive Insights
    const aiInsights = [
      `Overall SLA Compliance is currently at ${index.breakdown.slaComplianceRate}%. Top performing department: ${departmentScorecards[0]?.department || 'N/A'}.`,
      `Active emergency incidents requiring executive attention: ${activeEmergencies}.`,
      `Resolution rate across municipal wards stands at ${index.breakdown.resolutionRate}%.`,
    ];

    return sendSuccess(res, 'Executive Dashboard data retrieved successfully.', {
      cityPerformanceIndex: index,
      totalComplaints,
      activeComplaints,
      resolvedToday,
      activeEmergencies,
      departmentScorecards,
      aiInsights,
    });
  } catch (error) {
    next(error);
  }
};

export const getGovernanceIndex = async (req, res, next) => {
  try {
    const index = await getCityPerformanceIndex();
    return sendSuccess(res, 'City Performance Index retrieved successfully.', index);
  } catch (error) {
    next(error);
  }
};

export const getLeaderboards = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().lean();
    const workers = await User.find({ role: 'field_worker' }).select('_id name email department employeeId').lean();

    // Department Leaderboard
    const deptMap = {};
    complaints.forEach((c) => {
      const d = c.department || 'Public Works';
      if (!deptMap[d]) {
        deptMap[d] = { name: d, total: 0, resolved: 0, slaSum: 0 };
      }
      deptMap[d].total += 1;
      if (['Resolved', 'Closed'].includes(c.status)) deptMap[d].resolved += 1;
      const sla = computeSLAStatus(c);
      deptMap[d].slaSum += sla.slaPercentage;
    });

    const departmentLeaderboard = Object.values(deptMap).map((d) => {
      const resolutionRate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 100;
      const avgSla = d.total > 0 ? Math.round(d.slaSum / d.total) : 100;
      const score = Math.round(resolutionRate * 0.6 + avgSla * 0.4);
      return {
        name: d.name,
        score,
        resolutionRate,
        slaCompliance: avgSla,
        totalResolved: d.resolved,
      };
    }).sort((a, b) => b.score - a.score);

    // Worker Leaderboard
    const workerLeaderboard = workers.map((w) => {
      const workerComplaints = complaints.filter((c) => String(c.assignedFieldWorker) === String(w._id));
      const completed = workerComplaints.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status)).length;
      const totalAssigned = workerComplaints.length;

      const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 85;
      const qualityScore = Math.min(98, 75 + completed * 3);

      return {
        id: w._id,
        name: w.name,
        department: w.department || 'General',
        employeeId: w.employeeId || 'FW-100',
        tasksCompleted: completed,
        totalAssigned,
        completionRate,
        qualityScore,
      };
    }).sort((a, b) => b.qualityScore - a.qualityScore);

    return sendSuccess(res, 'Leaderboards retrieved successfully.', {
      departmentLeaderboard,
      workerLeaderboard,
    });
  } catch (error) {
    next(error);
  }
};
