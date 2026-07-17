import React from 'react';
import styles from './TrackingCard.module.css';
import StatusBadge from '../StatusBadge/StatusBadge';

function TrackingCard({ complaint = {} }) {
  const {
    complaintId = 'CMP-Unknown',
    title = 'Service Request',
    category = 'General',
    priority = 'Medium',
    assignedFieldWorker,
    createdAt,
    updatedAt,
    expectedCompletionDate
  } = complaint;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.idLabel}>#{complaintId}</span>
        <StatusBadge status={complaint.status} />
      </div>

      <h3 className={styles.title}>{title}</h3>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Category</span>
          <span className={styles.metaValue}>{category}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Priority</span>
          <span className={`${styles.metaValue} ${styles[priority.toLowerCase()] || ''}`}>
            {priority}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Assigned Worker</span>
          <span className={styles.metaValue}>
            {assignedFieldWorker?.name || assignedFieldWorker || 'Not Assigned Yet'}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Submitted Date</span>
          <span className={styles.metaValue}>
            {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        {expectedCompletionDate && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Expected Resolution</span>
            <span className={styles.metaValue}>
              {new Date(expectedCompletionDate).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Last Updated</span>
          <span className={styles.metaValue}>
            {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TrackingCard;
