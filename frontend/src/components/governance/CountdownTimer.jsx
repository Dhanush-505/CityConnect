import React, { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [statusClass, setStatusClass] = useState(styles.onTrack);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft('No SLA set');
      return;
    }

    const updateTimer = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        const overdueMs = Math.abs(diff);
        const hours = Math.floor(overdueMs / (1000 * 60 * 60));
        const mins = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Overdue: ${hours}h ${mins}m`);
        setStatusClass(styles.overdue);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`Remaining: ${days}d ${hours}h`);
        setStatusClass(styles.onTrack);
      } else if (hours >= 6) {
        setTimeLeft(`Remaining: ${hours}h ${mins}m`);
        setStatusClass(styles.onTrack);
      } else {
        setTimeLeft(`Remaining: ${hours}h ${mins}m`);
        setStatusClass(styles.nearBreach);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`${styles.container} ${statusClass}`}>
      <span className={styles.icon}>⏳</span>
      <span>{timeLeft}</span>
    </div>
  );
};

export default CountdownTimer;
