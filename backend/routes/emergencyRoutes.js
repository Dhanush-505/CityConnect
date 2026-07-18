import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { reportEmergency, getEmergencyIncidents } from '../controllers/emergencyController.js';

const router = express.Router();

router.post('/', authMiddleware, reportEmergency);
router.get('/', authMiddleware, getEmergencyIncidents);

export default router;
