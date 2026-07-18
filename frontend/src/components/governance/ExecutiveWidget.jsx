import React from 'react';
import styles from './ExecutiveWidget.module.css';

const ExecutiveWidget = ({ title, value, icon, subtext, iconBg }) => {
  return (
    <div className={styles.widget}>
      <div className={styles.iconWrapper} style={{ backgroundColor: iconBg || '#f1f5f9' }}>
        {icon || '📊'}
      </div>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
        {subtext && <div className={styles.subtext}>{subtext}</div>}
      </div>
    </div>
  );
};

export default ExecutiveWidget;
