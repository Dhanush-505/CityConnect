import React from 'react';
import styles from './RemarksCard.module.css';

function RemarksCard({ complaint = {} }) {
  const { adminRemarks, citizenRemarks } = complaint;

  const timelineEntries = complaint.timeline || [];
  // Extract last field worker remark from timeline
  const lastWorkerEntry = [...timelineEntries]
    .reverse()
    .find((e) => e.role === 'field_worker' && e.remarks);

  const hasRemarks = adminRemarks || citizenRemarks || lastWorkerEntry;

  if (!hasRemarks) {
    return null;
  }

  return (
    <div className={styles.remarksCard}>
      <h3 className={styles.title}>Communications & Remarks</h3>
      <div className={styles.remarksList}>
        {/* Citizen remarks */}
        {citizenRemarks && (
          <div className={`${styles.remarkItem} ${styles.citizen}`}>
            <span className={styles.roleLabel}>Citizen Notes</span>
            <p className={styles.remarksText}>{citizenRemarks}</p>
          </div>
        )}

        {/* Worker remarks */}
        {lastWorkerEntry && (
          <div className={`${styles.remarkItem} ${styles.worker}`}>
            <span className={styles.roleLabel}>
              Field Officer Notes ({lastWorkerEntry.updatedBy})
            </span>
            <p className={styles.remarksText}>{lastWorkerEntry.remarks}</p>
          </div>
        )}

        {/* Admin remarks */}
        {adminRemarks && (
          <div className={`${styles.remarkItem} ${styles.admin}`}>
            <span className={styles.roleLabel}>Admin Instructions</span>
            <p className={styles.remarksText}>{adminRemarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RemarksCard;
