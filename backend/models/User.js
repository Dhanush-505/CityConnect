import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['citizen', 'field_worker', 'admin'], default: 'citizen' },
    department: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    profileImage: {
      publicId: { type: String, default: '' },
      url: { type: String, default: '' }
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
