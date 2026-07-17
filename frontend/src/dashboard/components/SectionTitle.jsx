import styles from '../styles/DashboardComponents.module.css';

function SectionTitle({ title, subtitle }) {
  return (
    <div className={styles.sectionTitleGroup}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default SectionTitle;
