import Issue from '../models/Issue.js';

const mapStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'open') return 'Pending';
  if (normalized === 'in-progress') return 'In Progress';
  if (normalized === 'resolved') return 'Resolved';
  return 'Closed';
};

export const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 6);
    const skip = (page - 1) * limit;

    const totalItems = await Issue.countDocuments({ createdBy: req.user.id });
    const items = await Issue.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedItems = items.map((issue) => ({
      id: issue._id,
      title: issue.title,
      department: issue.category,
      status: mapStatus(issue.status),
      priority: issue.priority || 'Medium',
      date: issue.createdAt,
      category: issue.category,
      location: issue.location,
    }));

    res.json({ items: formattedItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)), totalItems });
  } catch (error) {
    next(error);
  }
};

export const getComplaintStats = async (req, res, next) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.id }).lean();
    const totals = {
      total: issues.length,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };
    const categories = {
      Roads: 0,
      Electricity: 0,
      Drainage: 0,
      Water: 0,
      Garbage: 0,
      'Street Lights': 0,
    };

    issues.forEach((issue) => {
      const normalizedStatus = String(issue.status || '').toLowerCase();
      if (normalizedStatus === 'open') totals.pending += 1;
      if (normalizedStatus === 'in-progress') totals.inProgress += 1;
      if (normalizedStatus === 'resolved') totals.resolved += 1;

      const key = Object.keys(categories).find((category) =>
        category.toLowerCase() === String(issue.category || '').toLowerCase()
      );
      if (key) categories[key] += 1;
    });

    res.json({ totals, categories });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notificationList = [
      {
        id: 'notif-1',
        title: 'Complaint reviewed',
        message: 'Your issue is now under review by the city team.',
        time: '10 min ago',
        read: false,
      },
      {
        id: 'notif-2',
        title: 'New update available',
        message: 'The tracker page now shows expected completion dates.',
        time: '2 hr ago',
        read: true,
      },
      {
        id: 'notif-3',
        title: 'Payment reminder',
        message: 'Your profile needs a verification update.',
        time: 'Yesterday',
        read: true,
      },
    ];
    res.json(notificationList);
  } catch (error) {
    next(error);
  }
};

export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = [
      {
        id: 'announce-1',
        type: 'Maintenance',
        title: 'Water supply maintenance on Friday',
        message: 'Expect temporary disruptions in the north zone from 10 AM to 4 PM.',
        date: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        id: 'announce-2',
        type: 'Emergency',
        title: 'Road safety alert',
        message: 'Traffic diversions are active around the central market until further notice.',
        date: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        id: 'announce-3',
        type: 'Public Service',
        title: 'New feedback center launched',
        message: 'You can now submit feedback directly through your dashboard.',
        date: new Date(Date.now() - 1000 * 60 * 240),
      },
    ];
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.id }).lean();
    const totalComplaints = issues.length;
    const resolvedCount = issues.filter((issue) => String(issue.status).toLowerCase() === 'resolved').length;
    res.json({ totals: { total: totalComplaints, resolved: resolvedCount } });
  } catch (error) {
    next(error);
  }
};
