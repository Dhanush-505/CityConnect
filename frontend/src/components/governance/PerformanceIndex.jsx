import React from 'react';
import styles from './PerformanceIndex.module.css';

const PerformanceIndex = ({ indexData = {} }) => {
  const {
    score = 92,
    status = 'Excellent',
    breakdown = { resolutionRate: 90, slaComplianceRate: 88, feedbackScore: 92, emergencyResponseRate: 96 },
  } = indexData;

  return (
    <div className={styles.card}>
      <div className={styles.title}>🏆 CityConnect Smart Index</div>

      <div className={styles.scoreCircle} style={{ '--score-pct': score }}>
        <div className={styles.innerCircle}>
          <div className={styles.scoreNum}>{score}</div>
          <div className={styles.scoreMax}>/ 100</div>
        </div>
      </div>

      <div className={styles.statusText}>{status}</div>

      <div className={styles.breakdownGrid}>
        <div className={styles.bdItem}>
          <div className={styles.bdVal}>{breakdown.resolutionRate}%</div>
          <div className={styles.bdLbl}>Resolution Rate</div>
        </div>
        <div className={styles.bdItem}>
          <div className={styles.bdVal}>{breakdown.slaComplianceRate}%</div>
          <div className={styles.bdLbl}>SLA Compliance</div>
        </div>
        <div className={styles.bdItem}>
          <div className={styles.bdVal}>{breakdown.feedbackScore}%</div>
          <div className={styles.bdLbl}>Citizen Satisfaction</div>
        </div>
        <div className={styles.bdItem}>
          <div className={styles.bdVal}>{breakdown.emergencyResponseRate}%</div>
          <div className={styles.bdLbl}>Emergency Speed</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceIndex;
