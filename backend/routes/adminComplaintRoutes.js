import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import {
  getAdminComplaints,
  approveComplaint,
  rejectComplaint,
  assignComplaint,
  updateComplaintStatus,
  updateComplaintPriority,
  verifyCompletion,
  reopenComplaint,
} from '../controllers/adminComplaintController.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles('admin'), getAdminComplaints);
router.put('/:id/approve', authMiddleware, allowRoles('admin'), approveComplaint);
router.put('/:id/reject', authMiddleware, allowRoles('admin'), rejectComplaint);
router.put('/:id/assign', authMiddleware, allowRoles('admin'), assignComplaint);
router.put('/:id/status', authMiddleware, allowRoles('admin'), updateComplaintStatus);
router.put('/:id/priority', authMiddleware, allowRoles('admin'), updateComplaintPriority);
router.put('/:id/verify', authMiddleware, allowRoles('admin'), verifyCompletion);
router.put('/:id/reopen', authMiddleware, allowRoles('admin'), reopenComplaint);

export default router;
