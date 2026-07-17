import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getProfile,
  getComplaints,
  getComplaintStats,
  getNotifications,
  getAnnouncements,
  getDashboardSummary,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/user/profile', authMiddleware, getProfile);
router.get('/complaints', authMiddleware, getComplaints);
router.get('/complaints/stats', authMiddleware, getComplaintStats);
router.get('/notifications', authMiddleware, getNotifications);
router.get('/announcements', authMiddleware, getAnnouncements);
router.get('/dashboard', authMiddleware, getDashboardSummary);

export default router;
