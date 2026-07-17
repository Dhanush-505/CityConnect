import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import validateFields from '../middlewares/validationMiddleware.js';
import {
  createNotification,
  getNotifications,
  getNotificationById,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  deleteReadNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', authMiddleware, validateFields(['title', 'message']), createNotification);
router.get('/', authMiddleware, getNotifications);

router.put('/read-all', authMiddleware, markAllRead);
router.put('/:id/read', authMiddleware, markNotificationRead);

router.delete('/read', authMiddleware, deleteReadNotifications);
router.delete('/:id', authMiddleware, deleteNotification);
router.get('/:id', authMiddleware, getNotificationById);

export default router;
