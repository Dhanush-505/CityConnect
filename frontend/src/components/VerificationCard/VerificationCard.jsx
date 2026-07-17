import React, { useState } from 'react';
import styles from './VerificationCard.module.css';

function VerificationCard({ complaint = {}, onVerify }) {
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timelineEntries = complaint.timeline || [];
  // Find worker's final completion entry
  const completionEntry = [...timelineEntries]
    .reverse()
    .find((e) => e.status === 'Waiting Verification' && e.image);

  if (complaint.status !== 'Waiting Verification') {
    return null;
  }

  const handleAction = async (approved) => {
    setSubmitting(true);
    try {
      await onVerify(approved, remarks);
      setRemarks('');
    } catch (error) {
      // handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.verificationCard}>
      <h3 className={styles.title}>Action Required: Verify Completion</h3>
      <p className={styles.description}>
        The assigned worker has marked this complaint as resolved. Please review the proof below and verify completion.
      </p>

      {completionEntry ? (
        <div className={styles.proofSection}>
          <span className={styles.label}>Worker's Completion Image</span>
          <div className={styles.proofImage}>
            <img src={completionEntry.image} alt="Resolution proof" />
          </div>
          {completionEntry.remarks && (
            <div className={styles.notes}>
              <strong>Worker Notes:</strong> &ldquo;{completionEntry.remarks}&rdquo;
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noProof}>
          <p>No completion image attached, but task is waiting review.</p>
        </div>
      )}

      <div className={styles.actionForm}>
        <label className={styles.textareaLabel}>
          <span>Admin Remarks / Feedback</span>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add verification notes, reasons for rejection, or resolution remarks..."
            disabled={submitting}
          />
        </label>

        <div className={styles.btnRow}>
          <button
            type="button"
            className={`${styles.btn} ${styles.reject}`}
            onClick={() => handleAction(false)}
            disabled={submitting}
          >
            Reject Resolution
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.approve}`}
            onClick={() => handleAction(true)}
            disabled={submitting}
          >
            Approve & Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationCard;
