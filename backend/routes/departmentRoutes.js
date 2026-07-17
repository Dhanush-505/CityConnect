import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import { getDepartments, getDepartmentById, updateDepartment } from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', authMiddleware, getDepartments);
router.get('/:id', authMiddleware, getDepartmentById);
router.put('/:id', authMiddleware, allowRoles('admin'), updateDepartment);

export default router;
