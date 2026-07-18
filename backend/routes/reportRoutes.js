import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getDailyReports,
  getWeeklyReports,
  getMonthlyReports,
  getCustomReports,
  exportReport,
  scheduleReportConfig
} from '../controllers/reportController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/daily', getDailyReports);
router.get('/weekly', getWeeklyReports);
router.get('/monthly', getMonthlyReports);
router.get('/custom', getCustomReports);
router.post('/export', exportReport);
router.post('/schedule', scheduleReportConfig);

export default router;
