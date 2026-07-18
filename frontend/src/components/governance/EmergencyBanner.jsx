import React from 'react';
import styles from './EmergencyBanner.module.css';

const EmergencyBanner = ({ incidents = [], onReportClick }) => {
  const activeCount = incidents.length;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.icon}>🚨</div>
        <div>
          <div className={styles.title}>
            Emergency Response Center {activeCount > 0 ? `(${activeCount} Active)` : ''}
          </div>
          <div className={styles.subtext}>
            {activeCount > 0
              ? `Active Incident: ${incidents[0]?.title} (${incidents[0]?.location})`
              : 'Report critical hazards like road collapses, fires, floods, gas leaks, or power hazards immediately.'}
          </div>
        </div>
      </div>

      <button type="button" className={styles.reportBtn} onClick={onReportClick}>
        + Report Emergency
      </button>
    </div>
  );
};

export default EmergencyBanner;
