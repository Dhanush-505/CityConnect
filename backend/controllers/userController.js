import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users fetched successfully.', users);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 'Invalid user id.', 400);
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return sendError(res, 'User not found.', 404);

    return sendSuccess(res, 'User fetched successfully.', user);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 'Invalid user id.', 400);
    }

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.email;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return sendError(res, 'User not found.', 404);

    return sendSuccess(res, 'User updated successfully.', user);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return sendError(res, 'Invalid user id.', 400);
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 'User not found.', 404);

    return sendSuccess(res, 'User deleted successfully.', {});
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
