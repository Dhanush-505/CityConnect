import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import recordAuditLog from '../utils/auditLogger.js';

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'citizen',
  phone: user.phone || '',
  department: user.department || '',
  employeeId: user.employeeId || '',
  address: user.address || '',
  city: user.city || '',
  state: user.state || '',
  pincode: user.pincode || '',
  isActive: user.isActive !== false,
});

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone = '',
      role = 'citizen',
      department = '',
      employeeId = '',
      address = '',
      city = '',
      state = '',
      pincode = '',
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide your name, email and password' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedRole = String(role || 'citizen').trim().toLowerCase();
    if (!['citizen', 'field_worker'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Only citizen and field worker registrations are allowed' });
    }

    if (normalizedRole === 'field_worker' && !employeeId) {
      return res.status(400).json({ message: 'Employee ID is required for field workers' });
    }

    if (normalizedRole === 'field_worker' && !department) {
      return res.status(400).json({ message: 'Department is required for field workers' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: normalizedRole,
      department,
      employeeId,
      address,
      city,
      state,
      pincode,
      isActive: true,
    });

    const token = createToken(user);
    recordAuditLog({ req: { user: { email: user.email, name: user.name, id: user._id, role: user.role } }, action: 'USER_REGISTERED', module: 'AUTH', details: { email: user.email, role: user.role } });
    res.status(201).json({ user: buildUserPayload(user), token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);
    recordAuditLog({ req: { user: { email: user.email, name: user.name, id: user._id, role: user.role } }, action: 'USER_LOGIN', module: 'AUTH', details: { email: user.email, role: user.role } });
    res.json({ user: buildUserPayload(user), token });
  } catch (error) {
    next(error);
  }
};
