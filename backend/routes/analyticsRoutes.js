import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import {
  getDashboardAnalytics,
  getDepartmentAnalytics,
  getWorkerAnalytics,
  getCitizenAnalytics,
  getTrendsAnalytics,
  getResolutionTimeAnalytics,
  getSatisfactionAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardAnalytics);
router.get('/departments', getDepartmentAnalytics);
router.get('/workers', getWorkerAnalytics);
router.get('/citizens', getCitizenAnalytics);
router.get('/trends', getTrendsAnalytics);
router.get('/resolution-time', getResolutionTimeAnalytics);
router.get('/satisfaction', getSatisfactionAnalytics);

export default router;
