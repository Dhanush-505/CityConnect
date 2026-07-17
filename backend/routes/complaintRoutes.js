import express from 'express';
import {
  createComplaint,
  deleteComplaint,
  getComplaintStatsByCitizen,
  getComplaintsByCitizen,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaintById,
  searchComplaints,
  getComplaintTimeline,
  updateComplaintLocation,
} from '../controllers/complaintController.js';
import { updateComplaintStatus } from '../controllers/adminComplaintController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import validateFields from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, upload.array('images', 5), validateFields(['title', 'description', 'category']), createComplaint);
router.get('/stats', authMiddleware, getComplaintStatsByCitizen);
router.get('/search', authMiddleware, searchComplaints);
router.get('/', authMiddleware, getComplaintsByCitizen);
router.get('/all', authMiddleware, allowRoles('admin'), getComplaints);
router.get('/:id/timeline', authMiddleware, getComplaintTimeline);
router.get('/:id', authMiddleware, getComplaintById);
router.put('/:id/status', authMiddleware, allowRoles('admin'), updateComplaintStatus);
router.put('/:id/location', authMiddleware, updateComplaintLocation);
router.put('/:id', authMiddleware, updateComplaint);
router.delete('/:id', authMiddleware, deleteComplaint);

export default router;
