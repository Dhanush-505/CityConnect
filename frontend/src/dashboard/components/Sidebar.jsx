import { useMemo } from 'react';
import { MdDashboard, MdAddCircle, MdListAlt, MdTrackChanges, MdNotifications, MdStar, MdPerson, MdSettings, MdLogout, MdClose } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

const menuItems = [
  { label: 'Dashboard', icon: <MdDashboard />, key: 'dashboard' },
  { label: 'Raise Complaint', icon: <MdAddCircle />, key: 'raise' },
  { label: 'My Complaints', icon: <MdListAlt />, key: 'history' },
  { label: 'Complaint Tracker', icon: <MdTrackChanges />, key: 'tracker' },
  { label: 'Notifications', icon: <MdNotifications />, key: 'notifications' },
  { label: 'Feedback', icon: <MdStar />, key: 'feedback' },
  { label: 'Profile', icon: <MdPerson />, key: 'profile' },
  { label: 'Settings', icon: <MdSettings />, key: 'settings' },
];

function Sidebar({ isOpen, onClose, profile }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = useMemo(() => {
    if (location.pathname.includes('/citizen/raise-complaint')) return 'raise';
    if (location.pathname.includes('/citizen/my-complaints')) return 'history';
    if (location.pathname.includes('/citizen/tracker')) return 'tracker';
    if (location.pathname.includes('/citizen/notifications')) return 'notifications';
    if (location.pathname.includes('/citizen/feedback')) return 'feedback';
    if (location.pathname.includes('/citizen/profile')) return 'profile';
    if (location.pathname.includes('/citizen/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  const handleItemClick = (key) => {
    if (onClose) onClose();

    if (key === 'raise') {
      navigate('/citizen/raise-complaint');
    } else if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'history') {
      navigate('/citizen/my-complaints');
    } else if (key === 'tracker') {
      navigate('/citizen/tracker');
    } else if (key === 'notifications') {
      navigate('/citizen/notifications');
    } else if (key === 'feedback') {
      navigate('/citizen/feedback');
    } else if (key === 'profile') {
      navigate('/citizen/profile');
    } else if (key === 'settings') {
      navigate('/citizen/settings');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const profileName = profile?.name || 'Citizen';

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} aria-hidden={!isOpen && styles.open ? 'true' : 'false'}>
      <div className={styles.sidebarHeader}>
        <div>
          <p className={styles.brandLabel}>CityConnect</p>
          <p className={styles.brandTag}>Citizen Portal</p>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close sidebar">
          <MdClose size={22} />
        </button>
      </div>
      <div className={styles.profilePreview}>
        <div className={styles.avatar}>{profileName.charAt(0)}</div>
        <div>
          <p className={styles.profileName}>{profileName}</p>
          <p className={styles.profileRole}>Resident Member</p>
        </div>
      </div>
      <nav className={styles.navList}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.navItem} ${activeKey === item.key ? styles.active : ''}`}
            onClick={() => handleItemClick(item.key)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className={styles.logoutArea}>
        <button className={styles.logoutButton} type="button" onClick={handleLogout}>
          <MdLogout size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
