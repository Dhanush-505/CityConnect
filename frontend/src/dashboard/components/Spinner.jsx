import styles from '../styles/DashboardComponents.module.css';

function Spinner() {
  return (
    <div className={styles.spinnerFallback}>
      <div className={styles.spinnerDot}></div>
      <div className={styles.spinnerDot}></div>
      <div className={styles.spinnerDot}></div>
    </div>
  );
}

export default Spinner;
