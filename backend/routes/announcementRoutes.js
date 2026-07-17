import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import validateFields from '../middlewares/validationMiddleware.js';
import { createAnnouncement, getAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';

const router = express.Router();

router.post('/', authMiddleware, allowRoles('admin'), validateFields(['title', 'description']), createAnnouncement);
router.get('/', authMiddleware, getAnnouncements);
router.get('/:id', authMiddleware, getAnnouncementById);
router.put('/:id', authMiddleware, allowRoles('admin'), updateAnnouncement);
router.delete('/:id', authMiddleware, allowRoles('admin'), deleteAnnouncement);

export default router;
