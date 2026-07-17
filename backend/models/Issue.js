import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
