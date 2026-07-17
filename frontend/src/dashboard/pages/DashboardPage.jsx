import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowForward, MdBarChart, MdOutlineTrackChanges, MdTaskAlt } from 'react-icons/md';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import StatisticsCard from '../components/StatisticsCard';
import DashboardLayout from '../layout/DashboardLayout';
import { useDashboardData } from '../hooks/useDashboardData';
import SectionTitle from '../components/SectionTitle';
import styles from '../styles/DashboardPage.module.css';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';

const NotificationPanel = lazy(() => import('../components/NotificationPanel'));
const ErrorBoundary = lazy(() => import('../components/ErrorBoundary'));
const NearbyComplaints = lazy(() => import('../components/NearbyComplaints'));

function DashboardPage() {
  const navigate = useNavigate();
  const { profile, stats, notifications, announcements, loading, refresh, error } = useDashboardData();
  const [searchTerm, setSearchTerm] = useState('');

  const today = useMemo(() => formatDate(new Date()), []);

  const statsDefinition = useMemo(() => [
    { title: 'Total Complaints', value: stats?.totals?.total || 0, caption: 'All issues filed by you', icon: <MdTaskAlt /> },
    { title: 'Pending', value: stats?.totals?.pending || 0, caption: 'Awaiting city review', icon: <MdArrowForward /> },
    { title: 'In Progress', value: stats?.totals?.inProgress || 0, caption: 'Teams are working on it', icon: <MdOutlineTrackChanges /> },
    { title: 'Resolved', value: stats?.totals?.resolved || 0, caption: 'Successfully closed cases', icon: <MdBarChart /> },
  ], [stats]);

  const currentProgress = useMemo(() => ['Submitted', 'Under Review', 'Assigned', 'Work Started', 'Resolved'], []);

  if (loading) {
    return <Loader fullPage message="Loading dashboard..." />;
  }

  return (
    <ErrorBoundary>
      <DashboardLayout profile={profile} notificationsCount={notifications.length} searchValue={searchTerm} onSearchChange={setSearchTerm}>
        {error ? (
          <div className={styles.emptyState} style={{ marginBottom: '1rem' }}>
            <p>{error.message}</p>
          </div>
        ) : null}

        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <p className={styles.heroGreeting}>Good Morning,</p>
            <h1>Welcome back, {profile?.name || 'Citizen'}!</h1>
            <p className={styles.heroMeta}>{today} • Together, let’s build a better city.</p>
          </div>
          <div className={styles.heroActions}>
            <Button variant="primary" size="large" onClick={() => navigate('/citizen/raise-complaint')}>
              Raise a Complaint
            </Button>
            <Button variant="secondary" size="large" onClick={() => refresh()}>
              Refresh Dashboard
            </Button>
          </div>
        </section>

        <section className={styles.gridSection}>
          <SectionTitle title="Citizen Overview" subtitle="A modern view of your service requests and city updates." />
          <div className={styles.statsGrid}>
            {statsDefinition.map((stat) => (
              <StatisticsCard key={stat.title} icon={stat.icon} title={stat.title} value={stat.value} caption={stat.caption} />
            ))}
          </div>
        </section>

        <div className={styles.dashboardGrid}>
          <div className={styles.mainContent}>
            <section className={styles.panelSection}>
              <SectionTitle title="Nearby Community Complaints" subtitle="Support nearby issues and help local authorities prioritize them." />
              <Suspense fallback={<Loader message="Loading community complaints..." />}>
                <NearbyComplaints />
              </Suspense>
            </section>

            <section className={styles.panelSection}>
              <SectionTitle title="Government Notices" subtitle="Latest updates from your civic department." />
              <div className={styles.announcementPanel}>
                {announcements.length > 0 ? (
                  announcements.slice(0, 3).map((announcement) => (
                    <article key={announcement.id || announcement.title} className={styles.announcementCard}>
                      <p className={styles.announcementType}>{announcement.type || 'Notice'}</p>
                      <h3>{announcement.title}</h3>
                      <p>{announcement.message || announcement.body}</p>
                      <span>{formatRelativeTime(announcement.date || announcement.createdAt)}</span>
                    </article>
                  ))
                ) : (
                  <div className={styles.emptyState}>No notices available.</div>
                )}
              </div>
            </section>
          </div>

          <aside className={styles.sidebarColumn}>
            <div className={styles.widgetCard}>
              <SectionTitle title="Notifications" subtitle="Recent alerts from CityConnect." />
              <Suspense fallback={<Loader message="Loading notifications..." />}>
                <NotificationPanel notifications={notifications} />
              </Suspense>
            </div>
          </aside>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

export default DashboardPage;
