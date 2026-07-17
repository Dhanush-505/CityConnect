import React from 'react';
import { MdCheckCircle, MdOutlineCircle, MdPlayCircleFilled, MdError } from 'react-icons/md';
import styles from './Timeline.module.css';

const TIMELINE_STEPS = [
  { status: 'Submitted', label: 'Complaint Submitted' },
  { status: 'Under Review', label: 'Under Review' },
  { status: 'Approved', label: 'Approved' },
  { status: 'Assigned', label: 'Assigned' },
  { status: 'Accepted', label: 'Accepted Task' },
  { status: 'Travelling', label: 'Travelling' },
  { status: 'Work Started', label: 'Work Started' },
  { status: 'In Progress', label: 'Work In Progress' },
  { status: 'Waiting Verification', label: 'Admin Verification' },
  { status: 'Closed', label: 'Closed' }
];

function Timeline({ currentStatus = 'Submitted', timelineEntries = [] }) {
  // Find current step index in our steps definition
  let currentStepIndex = TIMELINE_STEPS.findIndex(
    (step) => step.status.toLowerCase() === currentStatus.toLowerCase()
  );
  
  if (currentStatus === 'Completed') {
    // Completed is equivalent to waiting verification step
    currentStepIndex = TIMELINE_STEPS.findIndex((step) => step.status === 'Waiting Verification') - 1;
  }

  const isRejected = currentStatus === 'Rejected';

  return (
    <div className={styles.timelineContainer}>
      {isRejected && (
        <div className={styles.rejectedBanner}>
          <MdError className={styles.rejectedIcon} />
          <div>
            <h4>Complaint Rejected</h4>
            <p>This complaint has been rejected by the administrator.</p>
          </div>
        </div>
      )}

      <div className={styles.timelineList}>
        {TIMELINE_STEPS.map((step, index) => {
          let stepState = 'future'; // completed, current, future
          
          if (!isRejected) {
            if (index < currentStepIndex) {
              stepState = 'completed';
            } else if (index === currentStepIndex) {
              stepState = 'current';
            }
          } else {
            // For rejected complaints, everything up to Approved is completed
            const approvedIdx = TIMELINE_STEPS.findIndex((s) => s.status === 'Approved');
            if (index <= approvedIdx) {
              stepState = 'completed';
            }
          }

          // Find corresponding timeline entry from database
          const matchedEntry = timelineEntries.find(
            (entry) => entry.status.toLowerCase() === step.status.toLowerCase()
          );

          return (
            <div
              key={step.status}
              className={`${styles.timelineItem} ${styles[stepState]}`}
            >
              <div className={styles.iconColumn}>
                <div className={styles.iconWrapper}>
                  {stepState === 'completed' && <MdCheckCircle className={styles.completedIcon} />}
                  {stepState === 'current' && <MdPlayCircleFilled className={styles.currentIcon} />}
                  {stepState === 'future' && <MdOutlineCircle className={styles.futureIcon} />}
                </div>
                {index < TIMELINE_STEPS.length - 1 && <div className={styles.line} />}
              </div>
              <div className={styles.contentColumn}>
                <span className={styles.stepLabel}>{step.label}</span>
                {matchedEntry ? (
                  <div className={styles.stepMeta}>
                    <span className={styles.timestamp}>
                      {new Date(matchedEntry.timestamp || matchedEntry.updatedAt).toLocaleString()}
                    </span>
                    {matchedEntry.remarks && (
                      <p className={styles.remarks}>{matchedEntry.remarks}</p>
                    )}
                  </div>
                ) : (
                  stepState === 'current' && (
                    <div className={styles.stepMeta}>
                      <span className={styles.pendingStatus}>In progress...</span>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
