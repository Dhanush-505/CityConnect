import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    category: { type: String, default: 'Service' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    adminReply: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Replied', 'Closed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ complaintId: 1, createdAt: -1 });
feedbackSchema.index({ citizenId: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
