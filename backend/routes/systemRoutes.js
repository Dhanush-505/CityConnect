import express from 'express';
import authMiddleware, { adminAuthMiddleware } from '../middlewares/authMiddleware.js';
import { getSystemHealth, getAuditLogs } from '../controllers/systemController.js';

const router = express.Router();

router.get('/health', getSystemHealth);
router.get('/audit-logs', adminAuthMiddleware, getAuditLogs);

export default router;
