import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { initSocket } from './utils/socket.js';
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import userRoutes from './routes/userRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import adminComplaintRoutes from './routes/adminComplaintRoutes.js';
import workerComplaintRoutes from './routes/workerComplaintRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import slaRoutes from './routes/slaRoutes.js';
import governanceRoutes from './routes/governanceRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import { getSystemHealth } from './controllers/systemController.js';
import securityMiddleware from './middlewares/securityMiddleware.js';
import sanitizeInput from './middlewares/sanitizeMiddleware.js';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import User from './models/User.js';
import Department from './models/Department.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
};

app.use(securityMiddleware);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use('/uploads', express.static('uploads'));

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin/complaints', adminComplaintRoutes);
app.use('/api/worker', workerComplaintRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api', governanceRoutes);
app.get('/api/health', getSystemHealth);
app.use('/api/system', systemRoutes);
app.use('/api', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const seedDemoUsers = async () => {
  try {
    const usersToSeed = [
      {
        name: 'City Admin',
        email: 'admin@cityconnect.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 99999 00001',
      },
      {
        name: 'City Citizen',
        email: 'citizen@cityconnect.com',
        password: 'Citizen@123',
        role: 'citizen',
        phone: '+91 99999 00002',
        address: 'Main Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      {
        name: 'Ravi Kumar',
        email: 'electric.worker@cityconnect.com',
        password: 'Worker@123',
        role: 'field_worker',
        phone: '+91 99999 00003',
        department: 'Electricity',
        employeeId: 'FW-EL-101',
      },
      {
        name: 'Meera Nair',
        email: 'water.worker@cityconnect.com',
        password: 'Worker@123',
        role: 'field_worker',
        phone: '+91 99999 00004',
        department: 'Water Supply',
        employeeId: 'FW-WS-202',
      },
      {
        name: 'Suresh Rao',
        email: 'drainage.worker@cityconnect.com',
        password: 'Worker@123',
        role: 'field_worker',
        phone: '+91 99999 00005',
        department: 'Drainage & Waste Management',
        employeeId: 'FW-DW-303',
      },
      {
        name: 'Hon. City Mayor',
        email: 'mayor@cityconnect.com',
        password: 'Mayor@123',
        role: 'mayor',
        phone: '+91 99999 00010',
      },
      {
        name: 'Municipal Commissioner',
        email: 'commissioner@cityconnect.com',
        password: 'Commissioner@123',
        role: 'municipal_commissioner',
        phone: '+91 99999 00011',
      },
    ];

    for (const seedUser of usersToSeed) {
      const normalizedEmail = String(seedUser.email).trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        await User.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              name: seedUser.name,
              password: await bcrypt.hash(seedUser.password, await bcrypt.genSalt(10)),
              role: seedUser.role,
              phone: seedUser.phone || '',
              department: seedUser.department || '',
              employeeId: seedUser.employeeId || '',
              address: seedUser.address || '',
              city: seedUser.city || '',
              state: seedUser.state || '',
              pincode: seedUser.pincode || '',
              isActive: true,
            },
          }
        );
        console.log(`Updated seeded user: ${normalizedEmail}`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(seedUser.password, salt);

      await User.create({
        name: seedUser.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: seedUser.role,
        phone: seedUser.phone || '',
        department: seedUser.department || '',
        employeeId: seedUser.employeeId || '',
        address: seedUser.address || '',
        city: seedUser.city || '',
        state: seedUser.state || '',
        pincode: seedUser.pincode || '',
        isActive: true,
      });

      console.log(`Seeded demo user: ${normalizedEmail}`);
    }
  } catch (seedError) {
    console.warn('Failed to seed demo users:', seedError.message);
  }
};

const seedDepartments = async () => {
  try {
    const departments = [
      { name: 'Electricity', code: 'ELEC', description: 'Electricity services and power outage management.' },
      { name: 'Water Supply', code: 'WTR', description: 'Water supply and pressure issues.' },
      { name: 'Drainage & Waste Management', code: 'DRAIN', description: 'Drainage and waste management operations.' },
    ];

    for (const department of departments) {
      const existing = await Department.findOne({ code: department.code });
      if (!existing) {
        await Department.create(department);
        console.log(`Seeded department: ${department.name}`);
      }
    }
  } catch (seedError) {
    console.warn('Failed to seed departments:', seedError.message);
  }
};

const server = createServer(app);
initSocket(server);

connectDB()
  .then(async () => {
    await seedDemoUsers();
    await seedDepartments();
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
  });
