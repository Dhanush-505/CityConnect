import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import styles from '../styles/DashboardLayout.module.css';

function DashboardLayout({ profile, notificationsCount, children, searchValue, onSearchChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('cityconnect-theme-mode');
    if (savedMode) return savedMode;
    return localStorage.getItem('cityconnect-theme') || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      const nextTheme = themeMode === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : themeMode;
      setResolvedTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.body.setAttribute('data-theme', nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
      localStorage.setItem('cityconnect-theme-mode', themeMode);
    };

    updateTheme();
    mediaQuery.addEventListener?.('change', updateTheme);

    return () => mediaQuery.removeEventListener?.('change', updateTheme);
  }, [themeMode]);

  const themeLabel = useMemo(() => (resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'), [resolvedTheme]);

  return (
    <div className={styles.dashboardShell} data-theme={resolvedTheme}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} profile={profile} />
      <div className={styles.contentArea}>
        <TopNavbar
          profile={profile}
          notificationsCount={notificationsCount}
          onMenuToggle={() => setSidebarOpen((open) => !open)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          theme={resolvedTheme}
          onThemeToggle={() => setThemeMode((current) => (current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'))}
          themeLabel={themeLabel}
        />
        <main className={styles.dashboardMain}>{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
