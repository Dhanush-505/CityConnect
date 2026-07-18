export const getSLAHours = (priority = 'Medium') => {
  const normalized = String(priority || '').trim().toLowerCase();
  switch (normalized) {
    case 'critical':
      return 24;
    case 'high':
      return 72; // 3 days
    case 'medium':
      return 120; // 5 days
    case 'low':
      return 168; // 7 days
    default:
      return 120;
  }
};

export const calculateSLADeadline = (createdAt = new Date(), priority = 'Medium') => {
  const hours = getSLAHours(priority);
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return { deadline, hours };
};

export const computeSLAStatus = (complaint) => {
  if (['Resolved', 'Closed', 'Rejected'].includes(complaint.status)) {
    return {
      isResolved: true,
      remainingMinutes: 0,
      overdueMinutes: 0,
      slaStatus: complaint.slaStatus || 'On Track',
      slaPercentage: 100,
    };
  }

  const now = new Date();
  const deadline = complaint.slaDeadline ? new Date(complaint.slaDeadline) : calculateSLADeadline(complaint.createdAt, complaint.priority).deadline;
  const diffMs = deadline.getTime() - now.getTime();
  const totalSLAHours = complaint.slaHours || getSLAHours(complaint.priority);
  const totalSlaMs = totalSLAHours * 60 * 60 * 1000;
  
  const isOverdue = diffMs < 0;
  const remainingMinutes = isOverdue ? 0 : Math.floor(diffMs / (1000 * 60));
  const overdueMinutes = isOverdue ? Math.abs(Math.floor(diffMs / (1000 * 60))) : 0;
  
  let slaStatus = 'On Track';
  if (isOverdue) {
    slaStatus = complaint.escalationLevel > 0 ? 'Escalated' : 'Breached';
  } else if (diffMs < totalSlaMs * 0.25) {
    slaStatus = 'Near Breach';
  }

  const elapsedMs = Math.max(0, totalSlaMs - Math.max(0, diffMs));
  const slaPercentage = Math.min(100, Math.max(0, Math.round(((totalSlaMs - (isOverdue ? Math.abs(diffMs) : 0)) / totalSlaMs) * 100)));

  return {
    isResolved: false,
    remainingMinutes,
    overdueMinutes,
    slaStatus,
    slaPercentage,
    deadline,
  };
};
