import { MdAdd } from 'react-icons/md';
import styles from '../styles/DashboardComponents.module.css';

function FloatingActionButton({ onClick }) {
  return (
    <button className={styles.fabButton} type="button" onClick={onClick} aria-label="Raise new complaint">
      <MdAdd size={28} />
      <span>New Complaint</span>
    </button>
  );
}

export default FloatingActionButton;
