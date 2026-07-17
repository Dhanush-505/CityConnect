import styles from '../styles/DashboardComponents.module.css';

function TimelineProgress({ steps = [], currentStage }) {
  const activeIndex = steps.findIndex((step) => step.toLowerCase() === currentStage?.toLowerCase());

  return (
    <div className={styles.timelineList}>
      {steps.map((step, index) => {
        const isActive = index <= activeIndex || activeIndex === -1;
        return (
          <div key={step} className={styles.timelineStep}>
            <div className={`${styles.timelineDot} ${isActive ? styles.timelineActive : ''}`} />
            <div className={styles.timelineContent}>
              <p className={styles.timelineStepLabel}>{step}</p>
              {index < steps.length - 1 && <div className={styles.timelineLine} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TimelineProgress;
