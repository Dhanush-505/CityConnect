import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    departmentHead: { type: String, default: '' },
    totalComplaints: { type: Number, default: 0 },
    pendingComplaints: { type: Number, default: 0 },
    resolvedComplaints: { type: Number, default: 0 },
    activeFieldWorkers: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
