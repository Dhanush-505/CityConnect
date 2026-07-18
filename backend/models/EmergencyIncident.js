import mongoose from 'mongoose';

const emergencyIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      unique: true,
      default: function () {
        return `EMG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      },
    },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Flood', 'Fire', 'Electrical Hazard', 'Road Collapse', 'Gas Leak', 'Water Burst', 'Other'],
      required: true,
    },
    location: { type: String, required: true, trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    description: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['Critical', 'High'], default: 'Critical' },
    status: { type: String, enum: ['Active', 'In Progress', 'Contained', 'Resolved'], default: 'Active' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporterName: { type: String, default: 'Citizen' },
    reporterPhone: { type: String, default: '' },
    assignedDepartment: { type: String, default: 'Emergency Services' },
    executiveAlerted: { type: Boolean, default: true },
    actionTaken: { type: String, default: '' },
  },
  { timestamps: true }
);

const EmergencyIncident = mongoose.model('EmergencyIncident', emergencyIncidentSchema);
export default EmergencyIncident;
