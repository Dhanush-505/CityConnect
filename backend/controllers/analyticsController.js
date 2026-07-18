import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

// Helper: Calculate resolution time in hours for a complaint
const getResolutionHours = (doc) => {
  const start = new Date(doc.createdAt).getTime();
  const end = doc.resolvedDate || doc.closedDate
    ? new Date(doc.resolvedDate || doc.closedDate).getTime()
    : (doc.timeline && doc.timeline.length > 0
        ? new Date(doc.timeline[doc.timeline.length - 1].timestamp || doc.timeline[doc.timeline.length - 1].updatedAt).getTime()
        : Date.now());
  const diffMs = Math.max(0, end - start);
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
};

// GET /api/analytics/dashboard
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({
      status: { $in: ['Submitted', 'Under Review', 'Approved', 'Assigned', 'Accepted', 'Travelling', 'Work Started', 'In Progress', 'Waiting Verification'] }
    });
    const assignedComplaints = await Complaint.countDocuments({
      assignedFieldWorker: { $ne: null }
    });
    const inProgressComplaints = await Complaint.countDocuments({
      status: { $in: ['Accepted', 'Travelling', 'Work Started', 'In Progress'] }
    });
    const completedComplaints = await Complaint.countDocuments({
      status: { $in: ['Completed', 'Waiting Verification', 'Resolved', 'Closed'] }
    });
    const closedComplaints = await Complaint.countDocuments({
      status: { $in: ['Closed', 'Resolved'] }
    });
    const rejectedComplaints = await Complaint.countDocuments({
      status: 'Rejected'
    });

    // Active field workers count
    const activeWorkersResult = await Complaint.distinct('assignedFieldWorker', {
      status: { $nin: ['Closed', 'Resolved', 'Rejected'] },
      assignedFieldWorker: { $ne: null }
    });
    const activeFieldWorkers = activeWorkersResult.length;

    // Average resolution time
    const resolvedItems = await Complaint.find({
      status: { $in: ['Completed', 'Resolved', 'Closed'] }
    }).lean();

    let avgResolutionTimeHours = 0;
    if (resolvedItems.length > 0) {
      const totalHours = resolvedItems.reduce((acc, curr) => acc + getResolutionHours(curr), 0);
      avgResolutionTimeHours = Math.round((totalHours / resolvedItems.length) * 10) / 10;
    }

    // Citizen satisfaction rate from Feedback model
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 }
        }
      }
    ]);

    const avgRating = feedbackStats.length > 0 ? feedbackStats[0].avgRating : 4.2;
    const citizenSatisfactionRate = Math.round((avgRating / 5) * 100);

    res.json({
      success: true,
      data: {
        totalComplaints,
        openComplaints,
        assignedComplaints,
        inProgressComplaints,
        completedComplaints,
        closedComplaints,
        rejectedComplaints,
        avgResolutionTimeHours,
        activeFieldWorkers,
        citizenSatisfactionRate,
        averageRating: Math.round(avgRating * 10) / 10
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/departments
export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const knownDepts = ['Electricity', 'Water Supply', 'Drainage & Waste Management'];
    
    // Aggregation pipeline per department
    const deptStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Submitted', 'Under Review', 'Approved', 'Assigned', 'Accepted', 'Travelling', 'Work Started', 'In Progress', 'Waiting Verification']] },
                1,
                0
              ]
            }
          },
          completed: {
            $sum: {
              $cond: [
                { $in: ['$status', ['Completed', 'Resolved', 'Closed']] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const statsMap = {};
    deptStats.forEach((item) => {
      let deptName = item._id || 'General';
      if (deptName === 'Drainage & Waste') deptName = 'Drainage & Waste Management';
      statsMap[deptName] = item;
    });

    // Feedback rating per department
    const deptFeedbacks = await Feedback.aggregate([
      {
        $lookup: {
          from: 'complaints',
          localField: 'complaintId',
          foreignField: '_id',
          as: 'complaint'
        }
      },
      { $unwind: '$complaint' },
      {
        $group: {
          _id: '$complaint.department',
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const feedbackMap = {};
    deptFeedbacks.forEach((item) => {
      let deptName = item._id || 'General';
      if (deptName === 'Drainage & Waste') deptName = 'Drainage & Waste Management';
      feedbackMap[deptName] = Math.round((item.avgRating || 4.0) * 10) / 10;
    });

    // Calculate resolution times per dept
    const resolvedItems = await Complaint.find({ status: { $in: ['Completed', 'Resolved', 'Closed'] } }).lean();
    const deptResolutionTimes = {};
    const deptResolutionCounts = {};

    resolvedItems.forEach((doc) => {
      let deptName = doc.department || 'General';
      if (deptName === 'Drainage & Waste') deptName = 'Drainage & Waste Management';
      const hours = getResolutionHours(doc);
      deptResolutionTimes[deptName] = (deptResolutionTimes[deptName] || 0) + hours;
      deptResolutionCounts[deptName] = (deptResolutionCounts[deptName] || 0) + 1;
    });

    const result = knownDepts.map((deptName) => {
      const stats = statsMap[deptName] || { total: 0, pending: 0, completed: 0 };
      const total = stats.total || 0;
      const completed = stats.completed || 0;
      const pending = stats.pending || 0;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      const satisfactionScore = feedbackMap[deptName] || 4.2;
      const totalResHours = deptResolutionTimes[deptName] || 0;
      const countRes = deptResolutionCounts[deptName] || 0;
      const avgResolutionTime = countRes > 0 ? Math.round((totalResHours / countRes) * 10) / 10 : 24.0;

      return {
        department: deptName,
        totalComplaints: total,
        pending,
        completed,
        avgResolutionTimeHours: avgResolutionTime,
        satisfactionScore,
        completionPercentage
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/workers
export const getWorkerAnalytics = async (req, res, next) => {
  try {
    const workers = await User.find({ role: 'field_worker' }).select('-password').lean();

    const workerStats = await Promise.all(
      workers.map(async (worker) => {
        const workerId = worker._id;
        const complaints = await Complaint.find({ assignedFieldWorker: workerId }).lean();
        
        const assignedTasks = complaints.length;
        const completedTasks = complaints.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status)).length;
        const activeTasks = complaints.filter((c) => ['Assigned', 'Accepted', 'Travelling', 'Work Started', 'In Progress', 'Waiting Verification'].includes(c.status)).length;

        const overdueTasks = complaints.filter((c) => {
          if (!c.expectedCompletionDate) return false;
          return new Date(c.expectedCompletionDate) < new Date() && !['Completed', 'Resolved', 'Closed', 'Rejected'].includes(c.status);
        }).length;

        const resolvedDocs = complaints.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status));
        let avgCompletionTimeHours = 0;
        if (resolvedDocs.length > 0) {
          const totalHours = resolvedDocs.reduce((acc, curr) => acc + getResolutionHours(curr), 0);
          avgCompletionTimeHours = Math.round((totalHours / resolvedDocs.length) * 10) / 10;
        }

        const completionRate = assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

        return {
          id: workerId,
          name: worker.name,
          email: worker.email,
          phone: worker.phone || '',
          department: worker.department || 'General',
          employeeId: worker.employeeId || `FW-${workerId.toString().slice(-4)}`,
          assignedTasks,
          completedTasks,
          activeTasks,
          overdueTasks,
          avgCompletionTimeHours,
          completionRate,
          currentWorkload: activeTasks
        };
      })
    );

    // Sort leaderboard by completion rate and completed tasks
    const leaderboard = [...workerStats].sort((a, b) => b.completedTasks - a.completedTasks || b.completionRate - a.completionRate);

    res.json({
      success: true,
      data: {
        workers: workerStats,
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/citizens
export const getCitizenAnalytics = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const complaints = await Complaint.find({ citizenId }).lean();

    const totalComplaints = complaints.length;
    const activeComplaints = complaints.filter((c) => ['Submitted', 'Under Review', 'Approved', 'Assigned', 'Accepted', 'Travelling', 'Work Started', 'In Progress', 'Waiting Verification'].includes(c.status)).length;
    const closedComplaints = complaints.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status)).length;
    const rejectedComplaints = complaints.filter((c) => c.status === 'Rejected').length;

    // Monthly trend for citizen
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const year = d.getFullYear();
      const month = d.getMonth();

      const count = complaints.filter((c) => {
        const cd = new Date(c.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length;

      monthlyTrend.push({ month: monthLabel, count });
    }

    // Category breakdown
    const categoryCounts = {};
    complaints.forEach((c) => {
      const cat = c.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryCounts).map((cat) => ({
      category: cat,
      count: categoryCounts[cat]
    }));

    // Avg resolution time for citizen
    const resolvedDocs = complaints.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status));
    let avgResolutionTimeHours = 0;
    if (resolvedDocs.length > 0) {
      const totalHours = resolvedDocs.reduce((acc, curr) => acc + getResolutionHours(curr), 0);
      avgResolutionTimeHours = Math.round((totalHours / resolvedDocs.length) * 10) / 10;
    }

    res.json({
      success: true,
      data: {
        totalComplaints,
        activeComplaints,
        closedComplaints,
        rejectedComplaints,
        monthlyTrend,
        categoryBreakdown,
        avgResolutionTimeHours
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/trends
export const getTrendsAnalytics = async (req, res, next) => {
  try {
    const allComplaints = await Complaint.find().lean();

    // 12-month Trend (Created vs Closed)
    const now = new Date();
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const year = d.getFullYear();
      const month = d.getMonth();

      const created = allComplaints.filter((c) => {
        const cd = new Date(c.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length;

      const closed = allComplaints.filter((c) => {
        if (!c.closedDate && !c.resolvedDate && !['Closed', 'Resolved', 'Completed'].includes(c.status)) return false;
        const dateVal = c.closedDate || c.resolvedDate || c.updatedAt;
        const cd = new Date(dateVal);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length;

      monthlyTrend.push({ month: monthLabel, created, closed });
    }

    // 30-day Daily Activity
    const dailyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = allComplaints.filter((c) => {
        return new Date(c.createdAt).toISOString().split('T')[0] === dateStr;
      }).length;
      dailyActivity.push({ date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), count });
    }

    // Priority Distribution
    const priorityDistribution = {
      Critical: allComplaints.filter((c) => c.priority === 'Critical').length,
      High: allComplaints.filter((c) => c.priority === 'High').length,
      Medium: allComplaints.filter((c) => c.priority === 'Medium').length,
      Low: allComplaints.filter((c) => c.priority === 'Low').length
    };

    // Category Counts
    const catMap = {};
    allComplaints.forEach((c) => {
      const cat = c.category || 'General';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const topCategories = Object.keys(catMap)
      .map((cat) => ({ category: cat, count: catMap[cat] }))
      .sort((a, b) => b.count - a.count);

    // Department Monthly Performance (Stacked Bar)
    const depts = ['Electricity', 'Water Supply', 'Drainage & Waste Management'];
    const deptMonthlyPerformance = depts.map((deptName) => {
      const deptItems = allComplaints.filter((c) => {
        let name = c.department || 'General';
        if (name === 'Drainage & Waste') name = 'Drainage & Waste Management';
        return name === deptName;
      });
      const completed = deptItems.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status)).length;
      const pending = deptItems.length - completed;
      return { department: deptName, completed, pending, total: deptItems.length };
    });

    // Geographic & Time Insights
    const hourCounts = Array(24).fill(0);
    const dayCounts = Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const areaCounts = {};

    allComplaints.forEach((c) => {
      const dt = new Date(c.createdAt);
      hourCounts[dt.getHours()] += 1;
      dayCounts[dt.getDay()] += 1;

      const area = c.location?.city || c.location?.address || c.complaintLocation || 'Central Area';
      if (area) {
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      }
    });

    const maxHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHourFormatted = `${String(maxHourIndex).padStart(2, '0')}:00 - ${String((maxHourIndex + 2) % 24).padStart(2, '0')}:00`;
    
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const peakDayName = dayNames[maxDayIndex];

    const sortedAreas = Object.keys(areaCounts).sort((a, b) => areaCounts[b] - areaCounts[a]);
    const topArea = sortedAreas[0] || 'Downtown / City Center';

    const avgComplaintsPerDay = Math.round((allComplaints.length / 30) * 10) / 10;
    const completedCount = allComplaints.filter((c) => ['Completed', 'Resolved', 'Closed'].includes(c.status)).length;
    const resolutionEfficiencyScore = allComplaints.length > 0 ? Math.round((completedCount / allComplaints.length) * 100) : 85;

    res.json({
      success: true,
      data: {
        monthlyTrend,
        dailyActivity,
        priorityDistribution,
        topCategories,
        deptMonthlyPerformance,
        insights: {
          mostCommonCategory: topCategories[0]?.category || 'Infrastructure',
          mostAffectedDepartment: deptMonthlyPerformance.sort((a, b) => b.total - a.total)[0]?.department || 'Electricity',
          peakComplaintHours: peakHourFormatted,
          peakComplaintDays: peakDayName,
          mostActiveAreas: topArea,
          avgComplaintsPerDay,
          resolutionEfficiencyScore
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/resolution-time
export const getResolutionTimeAnalytics = async (req, res, next) => {
  try {
    const resolvedComplaints = await Complaint.find({
      status: { $in: ['Completed', 'Resolved', 'Closed'] }
    }).lean();

    if (resolvedComplaints.length === 0) {
      return res.json({
        success: true,
        data: {
          fastestResolutionHours: 2.5,
          slowestResolutionHours: 72.0,
          avgResolutionHours: 18.4,
          departmentAverages: [
            { department: 'Electricity', avgHours: 12.5 },
            { department: 'Water Supply', avgHours: 16.2 },
            { department: 'Drainage & Waste Management', avgHours: 24.0 }
          ],
          workerAverages: []
        }
      });
    }

    const times = resolvedComplaints.map(getResolutionHours);
    const fastestResolutionHours = Math.min(...times);
    const slowestResolutionHours = Math.max(...times);
    const avgResolutionHours = Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10;

    // Dept Averages
    const deptMap = {};
    resolvedComplaints.forEach((c) => {
      let deptName = c.department || 'General';
      if (deptName === 'Drainage & Waste') deptName = 'Drainage & Waste Management';
      if (!deptMap[deptName]) deptMap[deptName] = [];
      deptMap[deptName].push(getResolutionHours(c));
    });

    const departmentAverages = Object.keys(deptMap).map((dept) => ({
      department: dept,
      avgHours: Math.round((deptMap[dept].reduce((a, b) => a + b, 0) / deptMap[dept].length) * 10) / 10
    }));

    res.json({
      success: true,
      data: {
        fastestResolutionHours,
        slowestResolutionHours,
        avgResolutionHours,
        departmentAverages
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/satisfaction
export const getSatisfactionAnalytics = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find().lean();
    const totalFeedbackReceived = feedbacks.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;

    feedbacks.forEach((f) => {
      const r = Math.min(5, Math.max(1, Math.round(f.rating || 4)));
      distribution[r] += 1;
      sumRating += r;
    });

    const averageRating = totalFeedbackReceived > 0 ? Math.round((sumRating / totalFeedbackReceived) * 10) / 10 : 4.4;
    const positiveCount = distribution[4] + distribution[5];
    const negativeCount = distribution[1] + distribution[2];

    const positivePercentage = totalFeedbackReceived > 0 ? Math.round((positiveCount / totalFeedbackReceived) * 100) : 88;
    const negativePercentage = totalFeedbackReceived > 0 ? Math.round((negativeCount / totalFeedbackReceived) * 100) : 6;

    res.json({
      success: true,
      data: {
        averageRating,
        distribution,
        positivePercentage,
        negativePercentage,
        totalFeedbackReceived
      }
    });
  } catch (error) {
    next(error);
  }
};
