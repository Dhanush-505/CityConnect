import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['rating', 'multiple_choice', 'text'], required: true },
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    targetDepartment: { type: String, default: 'All' },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, default: null },
    responseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Survey = mongoose.model('Survey', surveySchema);
export default Survey;
