import connectDB from './config/db.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import { isValidTransition, calculateProgress } from './utils/workflowEngine.js';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
};

const runVerification = async () => {
  console.log('Starting workflow verification tests...');
  
  await connectDB();

  // 1. Validate State Transitions Matrix
  assert(isValidTransition('Submitted', 'Under Review'), 'Submitted -> Under Review is allowed');
  assert(isValidTransition('Submitted', 'Rejected'), 'Submitted -> Rejected is allowed');
  assert(!isValidTransition('Submitted', 'Completed'), 'Submitted -> Completed is blocked');
  assert(isValidTransition('Approved', 'Assigned'), 'Approved -> Assigned is allowed');
  assert(isValidTransition('Assigned', 'Accepted'), 'Assigned -> Accepted is allowed');
  assert(isValidTransition('Accepted', 'Travelling'), 'Accepted -> Travelling is allowed');
  assert(isValidTransition('Travelling', 'Work Started'), 'Travelling -> Work Started is allowed');
  assert(isValidTransition('Work Started', 'In Progress'), 'Work Started -> In Progress is allowed');
  assert(isValidTransition('In Progress', 'Completed'), 'In Progress -> Completed is allowed');
  assert(isValidTransition('Completed', 'Waiting Verification'), 'Completed -> Waiting Verification is allowed');
  assert(isValidTransition('Waiting Verification', 'Closed'), 'Waiting Verification -> Closed is allowed');
  assert(isValidTransition('Waiting Verification', 'In Progress'), 'Waiting Verification -> In Progress is allowed');

  // 2. Validate Progress Metrics
  assert(calculateProgress('Submitted') === 10, 'Submitted is 10%');
  assert(calculateProgress('Under Review') === 20, 'Under Review is 20%');
  assert(calculateProgress('Approved') === 30, 'Approved is 30%');
  assert(calculateProgress('Assigned') === 40, 'Assigned is 40%');
  assert(calculateProgress('Accepted') === 50, 'Accepted is 50%');
  assert(calculateProgress('Travelling') === 60, 'Travelling is 60%');
  assert(calculateProgress('Work Started') === 70, 'Work Started is 70%');
  assert(calculateProgress('In Progress') === 80, 'In Progress is 80%');
  assert(calculateProgress('Completed') === 90, 'Completed is 90%');
  assert(calculateProgress('Waiting Verification') === 90, 'Waiting Verification is 90%');
  assert(calculateProgress('Closed') === 100, 'Closed is 100%');

  // 3. Simulated DB workflow cycle
  const citizen = await User.create({
    name: 'Test Citizen',
    email: 'test.citizen@cityconnect.com',
    password: 'Password@123',
    role: 'citizen'
  });

  const worker = await User.create({
    name: 'Test Worker',
    email: 'test.worker@cityconnect.com',
    password: 'Password@123',
    role: 'field_worker'
  });

  console.log('Users created in MongoDB.');

  // Create Complaint (Initially Submitted)
  const complaint = await Complaint.create({
    citizenId: citizen._id,
    citizenName: citizen.name,
    title: 'Water pipe leakage verification test',
    description: 'A test pipeline complaint to verify the transition workflow lifecycle.',
    category: 'Water Supply',
    status: 'Submitted',
    latitude: 17.4483,
    longitude: 78.3741,
    complaintLocation: 'Hitech City, Hyderabad, India',
    location: {
      latitude: 17.4483,
      longitude: 78.3741,
      address: 'Hitech City, Hyderabad, India',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500081',
      landmark: 'Near Mindspace Hitech City'
    },
    timeline: [{
      status: 'Submitted',
      updatedBy: citizen.name,
      role: 'citizen',
      remarks: 'Complaint submitted by citizen',
      timestamp: new Date(),
      updatedAt: new Date()
    }]
  });

  assert(complaint.status === 'Submitted', 'Initial status is Submitted');
  assert(complaint.location.latitude === 17.4483, 'Complaint location latitude correctly saved');
  assert(complaint.location.city === 'Hyderabad', 'Complaint location city correctly saved');
  assert(complaint.timeline.length === 1, 'Initial timeline has 1 entry');
  assert(complaint.timeline[0].role === 'citizen', 'Initial timeline entry logged with citizen role');

  // Transition to Under Review
  complaint.status = 'Under Review';
  complaint.timeline.push({
    status: 'Under Review',
    updatedBy: 'Admin',
    role: 'admin',
    remarks: 'Admin is reviewing complaint',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Under Review', 'Status is Under Review');

  // Transition to Approved
  complaint.status = 'Approved';
  complaint.timeline.push({
    status: 'Approved',
    updatedBy: 'Admin',
    role: 'admin',
    remarks: 'Approved for repair',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Approved', 'Status is Approved');

  // Transition to Assigned
  complaint.assignedFieldWorker = worker._id;
  complaint.status = 'Assigned';
  complaint.timeline.push({
    status: 'Assigned',
    updatedBy: 'Admin',
    role: 'admin',
    remarks: 'Assigned to field officer',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Assigned', 'Status is Assigned');

  // Transition to Accepted
  complaint.status = 'Accepted';
  complaint.timeline.push({
    status: 'Accepted',
    updatedBy: worker.name,
    role: 'field_worker',
    remarks: 'Worker accepted the task',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Accepted', 'Status is Accepted');

  // Transition to Travelling
  complaint.status = 'Travelling';
  complaint.timeline.push({
    status: 'Travelling',
    updatedBy: worker.name,
    role: 'field_worker',
    remarks: 'Worker is travelling to site',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Travelling', 'Status is Travelling');

  // Transition to Work Started
  complaint.status = 'Work Started';
  complaint.timeline.push({
    status: 'Work Started',
    updatedBy: worker.name,
    role: 'field_worker',
    remarks: 'Worker started site repairs',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Work Started', 'Status is Work Started');

  // Transition to Completed -> Waiting Verification
  complaint.status = 'Waiting Verification';
  complaint.timeline.push({
    status: 'Waiting Verification',
    updatedBy: worker.name,
    role: 'field_worker',
    remarks: 'Completed work, waiting approval',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Waiting Verification', 'Status is Waiting Verification');

  // Transition to Closed
  complaint.status = 'Closed';
  complaint.timeline.push({
    status: 'Closed',
    updatedBy: 'Admin',
    role: 'admin',
    remarks: 'Verified and closed complaint',
    timestamp: new Date(),
    updatedAt: new Date()
  });
  await complaint.save();
  assert(complaint.status === 'Closed', 'Status is Closed');

  console.log('All workflow checks passed successfully!');
  process.exit(0);
};

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
