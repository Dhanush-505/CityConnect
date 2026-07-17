import styles from '../styles/DashboardComponents.module.css';

const statusMap = {
  pending: 'pending',
  'in progress': 'inProgress',
  resolved: 'resolved',
  closed: 'closed',
  assigned: 'assigned',
  review: 'review',
};

function StatusBadge({ status }) {
  const key = String(status).toLowerCase();
  const variant = statusMap[key] || 'pending';

  return <span className={`${styles.statusBadge} ${styles[variant]}`}>{status}</span>;
}

export default StatusBadge;
