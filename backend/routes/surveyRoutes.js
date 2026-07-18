import express from 'express';
import authMiddleware, { adminAuthMiddleware } from '../middlewares/authMiddleware.js';
import { createSurvey, getSurveys, submitSurveyResponse } from '../controllers/surveyController.js';

const router = express.Router();

router.post('/', adminAuthMiddleware, createSurvey);
router.get('/', authMiddleware, getSurveys);
router.post('/:id/respond', authMiddleware, submitSurveyResponse);

export default router;
