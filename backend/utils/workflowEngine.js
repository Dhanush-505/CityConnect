export const VALID_TRANSITIONS = {
  'Submitted': ['Under Review', 'Rejected', 'Approved'],
  'Under Review': ['Approved', 'Rejected'],
  'Approved': ['Assigned', 'Rejected'],
  'Assigned': ['Accepted', 'Travelling'],
  'Accepted': ['Travelling', 'Work Started'],
  'Travelling': ['Work Started'],
  'Work Started': ['In Progress', 'Completed'],
  'In Progress': ['Completed'],
  'Completed': ['Waiting Verification'],
  'Waiting Verification': ['Closed', 'In Progress'],
  'Closed': ['Under Review', 'In Progress', 'Assigned'],
  'Rejected': ['Under Review', 'Approved'],
};

export const isValidTransition = (currentStatus, nextStatus) => {
  if (!currentStatus) return true; // Initial creation
  if (currentStatus === nextStatus) return true; // Re-setting same status is fine
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
};

export const calculateProgress = (status) => {
  switch (status) {
    case 'Submitted': return 10;
    case 'Under Review': return 20;
    case 'Approved': return 30;
    case 'Assigned': return 40;
    case 'Accepted': return 50;
    case 'Travelling': return 60;
    case 'Work Started': return 70;
    case 'In Progress': return 80;
    case 'Completed': return 90;
    case 'Waiting Verification': return 90;
    case 'Closed': return 100;
    case 'Rejected': return 0;
    default: return 10;
  }
};
