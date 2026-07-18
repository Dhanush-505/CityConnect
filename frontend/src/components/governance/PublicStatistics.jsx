import React from 'react';
import styles from './PublicStatistics.module.css';

const PublicStatistics = ({ stats = {} }) => {
  const {
    totalComplaints = 0,
    resolvedComplaints = 0,
    resolutionRate = 100,
    cityIndexScore = 92,
  } = stats;

  return (
    <div className={styles.container}>
      <div className={styles.statCard}>
        <div className={styles.val}>{totalComplaints}</div>
        <div className={styles.lbl}>Total Grievances Registered</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.val}>{resolvedComplaints}</div>
        <div className={styles.lbl}>Successfully Resolved</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.val}>{resolutionRate}%</div>
        <div className={styles.lbl}>City Resolution Rate</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.val}>{cityIndexScore} / 100</div>
        <div className={styles.lbl}>Smart Governance Score</div>
      </div>
    </div>
  );
};

export default PublicStatistics;
