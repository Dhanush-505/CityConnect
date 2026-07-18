import express from 'express';
import authMiddleware, { adminAuthMiddleware } from '../middlewares/authMiddleware.js';
import { getSLAMetrics, escalateComplaints } from '../controllers/slaController.js';

const router = express.Router();

router.get('/', authMiddleware, getSLAMetrics);
router.put('/escalate', adminAuthMiddleware, escalateComplaints);

export default router;
