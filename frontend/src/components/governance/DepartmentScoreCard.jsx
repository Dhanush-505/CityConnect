import React from 'react';
import styles from './DepartmentScoreCard.module.css';

const DepartmentScoreCard = ({ scorecard }) => {
  const {
    department = 'Department',
    grade = 'A',
    resolutionRate = 0,
    slaCompliance = 0,
    totalComplaints = 0,
    resolved = 0,
    escalated = 0,
  } = scorecard || {};

  const getGradeClass = (g) => {
    switch (g) {
      case 'A+': return styles.gradeAPlus;
      case 'A': return styles.gradeA;
      case 'B': return styles.gradeB;
      case 'C': return styles.gradeC;
      default: return styles.gradeD;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.deptName}>🏢 {department}</div>
        <div className={`${styles.gradeBadge} ${getGradeClass(grade)}`}>
          {grade}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statVal}>{resolutionRate}%</div>
          <div className={styles.statLbl}>Resolution Rate</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statVal}>{slaCompliance}%</div>
          <div className={styles.statLbl}>SLA Compliance</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statVal}>{resolved} / {totalComplaints}</div>
          <div className={styles.statLbl}>Resolved / Total</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statVal}>{escalated}</div>
          <div className={styles.statLbl}>Escalations</div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentScoreCard;
