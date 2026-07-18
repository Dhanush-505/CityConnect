import React from 'react';
import styles from './SLACard.module.css';

const SLACard = ({ overallCompliance = 100, onTrackCount = 0, nearBreachCount = 0, breachedCount = 0, escalatedCount = 0 }) => {
  return (
    <div className={styles.slaCard}>
      <div className={styles.header}>
        <div className={styles.title}>
          ⏱️ SLA Compliance & Status
        </div>
        <span className={`${styles.badge} ${overallCompliance >= 80 ? styles.onTrack : overallCompliance >= 60 ? styles.nearBreach : styles.breached}`}>
          {overallCompliance}% Compliant
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.metric}>
          <div className={styles.metricValue}>{onTrackCount}</div>
          <div className={styles.metricLabel}>On Track</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricValue}>{nearBreachCount}</div>
          <div className={styles.metricLabel}>Near Breach</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricValue}>{breachedCount}</div>
          <div className={styles.metricLabel}>Breached</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricValue}>{escalatedCount}</div>
          <div className={styles.metricLabel}>Escalated</div>
        </div>
      </div>
    </div>
  );
};

export default SLACard;
