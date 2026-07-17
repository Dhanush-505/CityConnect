import Department from '../models/Department.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 'Departments fetched successfully.', departments);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid department id.', 400);
    const department = await Department.findById(req.params.id);
    if (!department) return sendError(res, 'Department not found.', 404);
    return sendSuccess(res, 'Department fetched successfully.', department);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateDepartment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return sendError(res, 'Invalid department id.', 400);
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return sendError(res, 'Department not found.', 404);
    return sendSuccess(res, 'Department updated successfully.', department);
  } catch (error) {
    return sendError(res, 'Department update failed.', 500);
  }
};
