import React from 'react';
import styles from './ProgressBar.module.css';

function ProgressBar({ progress = 0, label = 'Complaint Progress' }) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressVal}>{clampedProgress}%</span>
      </div>
      <div className={styles.track}>
        <div 
          className={styles.bar} 
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
