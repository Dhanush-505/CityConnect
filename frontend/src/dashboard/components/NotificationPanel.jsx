import { MdNotificationsActive, MdCheckCircle, MdErrorOutline } from 'react-icons/md';
import styles from '../styles/DashboardComponents.module.css';

function NotificationPanel({ notifications = [] }) {
  return (
    <div className={styles.notificationPanel}>
      {notifications.length === 0 ? (
        <div className={styles.emptyState}>No new notifications yet.</div>
      ) : (
        notifications.slice(0, 5).map((notification) => (
          <div key={notification.id || notification._id} className={styles.notificationItem}>
            <div className={styles.notificationIcon}>
              {notification.read ? <MdCheckCircle /> : <MdNotificationsActive />}
            </div>
            <div className={styles.notificationContent}>
              <h4>{notification.title || notification.subject}</h4>
              <p>{notification.message || notification.description}</p>
            </div>
            <div className={styles.notificationMeta}>
              <span>{notification.time || notification.createdAt}</span>
              {!notification.read && <MdErrorOutline className={styles.unreadDot} />}
            </div>
          </div>
        ))
      )}
      <button className={styles.viewAllButton} type="button">
        View All Notifications
      </button>
    </div>
  );
}

export default NotificationPanel;
