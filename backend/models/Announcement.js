import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    department: { type: String, default: 'All' },
    audience: {
      type: String,
      enum: ['All Citizens', 'Electricity Users', 'Water Supply Users', 'Drainage & Waste Management Users', 'Field Workers', 'Everyone'],
      default: 'All Citizens',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null },
    status: { type: String, enum: ['Draft', 'Published', 'Expired'], default: 'Published' },
    attachments: [
      {
        publicId: { type: String, default: '' },
        url: { type: String, default: '' },
        fileType: { type: String, default: '' } // e.g., image, pdf
      }
    ],
  },
  { timestamps: true }
);

announcementSchema.index({ status: 1, publishedDate: -1 });
announcementSchema.index({ audience: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
