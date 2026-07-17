import React from 'react';
import styles from './ActivityCard.module.css';

function ActivityCard({ title, detail, time, badgeText, badgeVariant = 'info', image }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h4 className={styles.title}>{title}</h4>
          {badgeText && (
            <span className={`${styles.badge} ${styles[badgeVariant] || ''}`}>
              {badgeText}
            </span>
          )}
        </div>
        {time && <span className={styles.time}>{time}</span>}
      </div>
      
      {detail && <p className={styles.detail}>{detail}</p>}
      
      {image && (
        <div className={styles.imageContainer}>
          <img src={image} alt="Activity attachment" loading="lazy" />
        </div>
      )}
    </article>
  );
}

export default ActivityCard;
