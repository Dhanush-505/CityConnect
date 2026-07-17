import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { getWorkerTasks, getWorkerTaskById, acceptTask, updateTaskProgress, completeTask } from '../controllers/fieldWorkerController.js';

const router = express.Router();

router.get('/tasks', authMiddleware, allowRoles('field_worker'), getWorkerTasks);
router.get('/tasks/:id', authMiddleware, allowRoles('field_worker'), getWorkerTaskById);
router.put('/tasks/:id/accept', authMiddleware, allowRoles('field_worker'), acceptTask);
router.put('/tasks/:id/progress', authMiddleware, allowRoles('field_worker'), upload.single('image'), updateTaskProgress);
router.put('/tasks/:id/complete', authMiddleware, allowRoles('field_worker'), upload.single('image'), completeTask);

export default router;
