import styles from '../styles/DashboardComponents.module.css';
import { Button } from '../../components/common';

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <article className={styles.quickActionCard}>
      <div className={styles.quickActionIcon}>{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Button variant="secondary" onClick={onClick}>
        Open
      </Button>
    </article>
  );
}

export default QuickActionCard;
