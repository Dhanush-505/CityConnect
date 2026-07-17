import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    updatedBy: { type: String, default: '' },
    role: { type: String, default: '' },
    remarks: { type: String, default: '' },
    image: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      default: function () {
        return `CMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      },
    },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    citizenName: { type: String, required: true, trim: true },
    citizenPhone: { type: String, default: '' },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 30, maxlength: 1000 },
    department: { type: String, default: 'General' },
    category: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Assigned', 'Accepted', 'Travelling', 'Work Started', 'In Progress', 'Completed', 'Waiting Verification', 'Resolved', 'Closed', 'Rejected'],
      default: 'Submitted',
    },
    complaintImages: [
      {
        publicId: { type: String, default: '' },
        url: { type: String, default: '' },
        uploadedBy: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    progressImages: [
      {
        publicId: { type: String, default: '' },
        url: { type: String, default: '' },
        uploadedBy: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    completionImages: [
      {
        publicId: { type: String, default: '' },
        url: { type: String, default: '' },
        uploadedBy: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    complaintLocation: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' }
    },
    assignedFieldWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    adminRemarks: { type: String, default: '' },
    citizenRemarks: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    expectedCompletionDate: { type: Date, default: null },
    resolvedDate: { type: Date, default: null },
    closedDate: { type: Date, default: null },
    timeline: { type: [timelineEntrySchema], default: [] },
  },
  { timestamps: true }
);

complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ citizenId: 1, createdAt: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
