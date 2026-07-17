import { useState } from 'react';
import { MdMenu, MdSearch, MdNotifications, MdKeyboardArrowDown, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/TopNavbar.module.css';

function TopNavbar({ profile, notificationsCount, onMenuToggle, searchValue, onSearchChange, theme, onThemeToggle, themeLabel }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileAction = (action) => {
    setMenuOpen(false);
    if (action === 'profile') navigate('/citizen/profile');
    if (action === 'settings') navigate('/citizen/settings');
    if (action === 'logout') {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.leftGroup}>
        <button className={styles.menuButton} onClick={onMenuToggle} aria-label="Toggle navigation">
          <MdMenu size={24} />
        </button>
        <div className={styles.brand}>CityConnect</div>
      </div>

      <div className={styles.searchGroup}>
        <MdSearch className={styles.searchIcon} />
        <input
          type="search"
          value={searchValue || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search complaints, locations or status"
          aria-label="Search dashboard"
        />
      </div>

      <div className={styles.rightGroup}>
        <button type="button" className={styles.themeButton} onClick={onThemeToggle} aria-label={themeLabel}>
          {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button className={styles.notificationButton} aria-label="View notifications" onClick={() => navigate('/citizen/notifications')}>
          <MdNotifications size={24} />
          {notificationsCount > 0 && <span className={styles.notificationBadge}>{notificationsCount}</span>}
        </button>

        <div className={styles.profileGroup}>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Profile options"
          >
            <div className={styles.avatar}>{profile?.name?.charAt(0) || 'C'}</div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{profile?.name || 'Citizen'}</span>
              <span className={styles.profileStatus}>Active Member</span>
            </div>
            <MdKeyboardArrowDown size={20} className={styles.dropdownIcon} />
          </button>

          {menuOpen && (
            <div className={styles.profileMenu} role="menu">
              <button type="button" onClick={() => handleProfileAction('profile')}>
                View Profile
              </button>
              <button type="button" onClick={() => handleProfileAction('settings')}>
                Settings
              </button>
              <button type="button" onClick={() => handleProfileAction('logout')}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
