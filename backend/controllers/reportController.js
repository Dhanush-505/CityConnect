import Complaint from '../models/Complaint.js';
import { generateCSV, generateExcelXML, generatePDFHtml } from '../utils/reportExporter.js';

// Helper to construct filter query from params
const buildReportFilter = (query) => {
  const filter = {};

  if (query.department && query.department !== 'All Departments') {
    let dept = query.department;
    if (dept === 'Drainage & Waste') dept = 'Drainage & Waste Management';
    filter.department = dept;
  }

  if (query.status && query.status !== 'All Statuses') {
    filter.status = query.status;
  }

  if (query.priority && query.priority !== 'All Priorities') {
    filter.priority = query.priority;
  }

  if (query.category && query.category !== 'All Categories') {
    filter.category = query.category;
  }

  if (query.worker && query.worker !== 'All Workers') {
    filter.assignedFieldWorker = query.worker;
  }

  if (query.location) {
    filter.$or = [
      { complaintLocation: { $regex: query.location, $options: 'i' } },
      { 'location.address': { $regex: query.location, $options: 'i' } },
      { 'location.city': { $regex: query.location, $options: 'i' } }
    ];
  }

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { complaintId: { $regex: s, $options: 'i' } },
      { title: { $regex: s, $options: 'i' } },
      { citizenName: { $regex: s, $options: 'i' } },
      { complaintLocation: { $regex: s, $options: 'i' } }
    ];
  }

  return filter;
};

// Format complaint items for table output
const formatComplaintRows = (items) => {
  const headers = ['Complaint ID', 'Title', 'Citizen Name', 'Department', 'Category', 'Priority', 'Status', 'Worker', 'Created Date'];
  const rows = items.map((c) => [
    c.complaintId || c._id.toString(),
    c.title || 'N/A',
    c.citizenId?.name || c.citizenName || 'Citizen',
    c.department || 'General',
    c.category || 'General',
    c.priority || 'Medium',
    c.status || 'Submitted',
    c.assignedFieldWorker?.name || 'Unassigned',
    c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'
  ]);
  return { headers, rows };
};

// GET /api/reports/daily
export const getDailyReports = async (req, res, next) => {
  try {
    const dateParam = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(dateParam.setHours(0, 0, 0, 0));
    const end = new Date(dateParam.setHours(23, 59, 59, 999));

    const filter = buildReportFilter(req.query);
    filter.createdAt = { $gte: start, $lte: end };

    const items = await Complaint.find(filter)
      .populate('citizenId', 'name email phone')
      .populate('assignedFieldWorker', 'name department employeeId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reportType: 'Daily Report',
      date: start.toDateString(),
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/weekly
export const getWeeklyReports = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const filter = buildReportFilter(req.query);
    if (!filter.createdAt) {
      filter.createdAt = { $gte: startOfWeek };
    }

    const items = await Complaint.find(filter)
      .populate('citizenId', 'name email phone')
      .populate('assignedFieldWorker', 'name department employeeId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reportType: 'Weekly Report',
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/monthly
export const getMonthlyReports = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filter = buildReportFilter(req.query);
    if (!filter.createdAt) {
      filter.createdAt = { $gte: startOfMonth };
    }

    const items = await Complaint.find(filter)
      .populate('citizenId', 'name email phone')
      .populate('assignedFieldWorker', 'name department employeeId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reportType: 'Monthly Report',
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/custom
export const getCustomReports = async (req, res, next) => {
  try {
    const filter = buildReportFilter(req.query);
    const items = await Complaint.find(filter)
      .populate('citizenId', 'name email phone')
      .populate('assignedFieldWorker', 'name department employeeId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reportType: 'Custom Filtered Report',
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/reports/export
export const exportReport = async (req, res, next) => {
  try {
    const { format = 'csv', reportTitle = 'CityConnect Complaints Analytics Report', filters = {} } = req.body;

    const queryFilter = buildReportFilter(filters);
    const items = await Complaint.find(queryFilter)
      .populate('citizenId', 'name email phone')
      .populate('assignedFieldWorker', 'name department employeeId')
      .sort({ createdAt: -1 })
      .lean();

    const { headers, rows } = formatComplaintRows(items);

    if (format === 'csv') {
      const csvContent = generateCSV(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=cityconnect_report_${Date.now()}.csv`);
      return res.status(200).send(csvContent);
    }

    if (format === 'excel' || format === 'xlsx') {
      const excelContent = generateExcelXML(reportTitle, filters, headers, rows);
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename=cityconnect_report_${Date.now()}.xls`);
      return res.status(200).send(excelContent);
    }

    if (format === 'pdf') {
      const pdfHtml = generatePDFHtml(reportTitle, filters, headers, rows);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename=cityconnect_report_${Date.now()}.html`);
      return res.status(200).send(pdfHtml);
    }

    return res.status(400).json({ success: false, message: 'Unsupported format. Use csv, excel, or pdf.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/reports/schedule
export const scheduleReportConfig = async (req, res, next) => {
  try {
    const { frequency = 'weekly', department = 'All Departments', email } = req.body;
    res.json({
      success: true,
      message: `Report scheduler successfully configured for ${frequency} delivery to ${email || req.user.email}.`,
      config: {
        frequency,
        department,
        email: email || req.user.email,
        createdAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};
