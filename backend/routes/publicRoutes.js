import express from 'express';
import { getPublicDashboardData } from '../controllers/publicController.js';

const router = express.Router();

router.get('/dashboard', getPublicDashboardData);

export default router;
