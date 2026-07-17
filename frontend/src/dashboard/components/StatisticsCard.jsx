import styles from '../styles/DashboardComponents.module.css';

function StatisticsCard({ icon, title, value, caption }) {
  return (
    <article className={styles.statCard} tabIndex={0}>
      <div className={styles.statCardHeader}>
        <div className={styles.statIcon}>{icon}</div>
        <span className={styles.statLabel}>{title}</span>
      </div>
      <div className={styles.statValue}>{value}</div>
      {caption && <p className={styles.statCaption}>{caption}</p>}
    </article>
  );
}

export default StatisticsCard;
