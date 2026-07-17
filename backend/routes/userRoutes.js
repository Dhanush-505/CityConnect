import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles from '../middlewares/roleMiddleware.js';
import validateFields from '../middlewares/validationMiddleware.js';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles('admin'), getUsers);
router.get('/:id', authMiddleware, allowRoles('admin'), getUserById);
router.put('/:id', authMiddleware, allowRoles('admin'), validateFields(['name']), updateUser);
router.delete('/:id', authMiddleware, allowRoles('admin'), deleteUser);

export default router;
