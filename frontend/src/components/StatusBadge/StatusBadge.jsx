import React from 'react';
import styles from './StatusBadge.module.css';

function StatusBadge({ status = 'Submitted' }) {
  const normalizedStatus = String(status || 'Submitted').trim();
  
  // Create class variant based on the status name
  const statusClass = normalizedStatus.toLowerCase().replace(/\s+/g, '');

  return (
    <span className={`${styles.badge} ${styles[statusClass] || styles.submitted}`}>
      {normalizedStatus}
    </span>
  );
}

export default StatusBadge;
