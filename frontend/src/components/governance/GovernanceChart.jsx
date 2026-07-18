import React from 'react';
import styles from './GovernanceChart.module.css';

const GovernanceChart = ({ title = 'Department SLA Performance', data = [] }) => {
  const getColor = (val) => {
    if (val >= 85) return 'linear-gradient(90deg, #10b981, #059669)';
    if (val >= 70) return 'linear-gradient(90deg, #3b82f6, #2563eb)';
    if (val >= 50) return 'linear-gradient(90deg, #f59e0b, #d97706)';
    return 'linear-gradient(90deg, #ef4444, #dc2626)';
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.title}>📈 {title}</div>
      <div className={styles.barList}>
        {data.map((item, idx) => (
          <div key={idx} className={styles.barRow}>
            <div className={styles.barHeader}>
              <span>{item.label || item.department || item.name}</span>
              <span>{item.value || item.percentage || item.resolutionRate || 0}%</span>
            </div>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{
                  width: `${Math.min(100, Math.max(0, item.value || item.percentage || item.resolutionRate || 0))}%`,
                  background: getColor(item.value || item.percentage || item.resolutionRate || 0),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovernanceChart;
