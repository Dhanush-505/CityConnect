import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import validateFields from '../middlewares/validationMiddleware.js';
import { createFeedback, getFeedbacks, getFeedbackById, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', authMiddleware, validateFields(['complaintId', 'rating', 'subject', 'message']), createFeedback);
router.get('/', authMiddleware, getFeedbacks);
router.get('/:id', authMiddleware, getFeedbackById);
router.put('/:id', authMiddleware, updateFeedback);
router.delete('/:id', authMiddleware, deleteFeedback);

export default router;
