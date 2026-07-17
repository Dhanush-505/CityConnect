import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cityconnect');

  const usersToSeed = [
    { name: 'City Admin', email: 'admin@cityconnect.com', password: 'Admin@123', role: 'admin', phone: '+91 99999 00001' },
    { name: 'City Citizen', email: 'citizen@cityconnect.com', password: 'Citizen@123', role: 'citizen', phone: '+91 99999 00002' },
    { name: 'Ravi Kumar', email: 'electric.worker@cityconnect.com', password: 'Worker@123', role: 'field_worker', phone: '+91 99999 00003', department: 'Electricity', employeeId: 'FW-EL-101' },
    { name: 'Meera Nair', email: 'water.worker@cityconnect.com', password: 'Worker@123', role: 'field_worker', phone: '+91 99999 00004', department: 'Water Supply', employeeId: 'FW-WS-202' },
    { name: 'Suresh Rao', email: 'drainage.worker@cityconnect.com', password: 'Worker@123', role: 'field_worker', phone: '+91 99999 00005', department: 'Drainage & Waste Management', employeeId: 'FW-DW-303' },
  ];

  for (const seedUser of usersToSeed) {
    const normalizedEmail = String(seedUser.email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (!existing) {
      await User.create({
        ...seedUser,
        email: normalizedEmail,
        password: await bcrypt.hash(seedUser.password, 10),
      });
    }
  }

  const departments = [
    { name: 'Electricity', code: 'ELEC', description: 'Electricity services and power outage management.' },
    { name: 'Water Supply', code: 'WTR', description: 'Water supply and pressure issues.' },
    { name: 'Drainage & Waste Management', code: 'DRAIN', description: 'Drainage and waste management operations.' },
  ];

  for (const department of departments) {
    const existing = await Department.findOne({ code: department.code });
    if (!existing) {
      await Department.create(department);
    }
  }

  console.log('Seed completed');
  await mongoose.disconnect();
};

seed().catch(console.error);
