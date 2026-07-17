import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdDashboard, MdListAlt, MdTrackChanges, MdNotifications, MdPerson, MdSettings, MdLogout } from 'react-icons/md';
import styles from '../styles/FieldWorkerLayout.module.css';

const navigation = [
  { to: '/field-worker', label: 'Dashboard', icon: <MdDashboard /> },
  { to: '/field-worker/tasks', label: 'My Tasks', icon: <MdListAlt /> },
  { to: '/field-worker/tracker', label: 'Task Tracker', icon: <MdTrackChanges /> },
  { to: '/field-worker/notifications', label: 'Notifications', icon: <MdNotifications /> },
  { to: '/field-worker/profile', label: 'Profile', icon: <MdPerson /> },
  { to: '/field-worker/settings', label: 'Settings', icon: <MdSettings /> },
];

function FieldWorkerLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div>
            <p className={styles.brand}>CityConnect</p>
            <p className={styles.role}>Field Worker Portal</p>
          </div>
        </div>

        <nav className={styles.navList}>
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.homeLink}>Back to Home</Link>
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}

export default FieldWorkerLayout;
