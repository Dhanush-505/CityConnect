import express from 'express';
import authMiddleware, { adminAuthMiddleware } from '../middlewares/authMiddleware.js';
import {
  getExecutiveDashboard,
  getGovernanceIndex,
  getLeaderboards,
} from '../controllers/governanceController.js';

const router = express.Router();

router.get('/executive/dashboard', adminAuthMiddleware, getExecutiveDashboard);
router.get('/governance/index', authMiddleware, getGovernanceIndex);
router.get('/leaderboards', authMiddleware, getLeaderboards);

export default router;
