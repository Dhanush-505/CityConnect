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
      <DashboardLayout
        profile={profile}
        notificationsCount={Array.isArray(notifications) ? notifications.length : (notifications?.unreadCount || notifications?.notifications?.length || 0)}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
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

            <section className={styles.panelSection} style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
              <SectionTitle title="Personal Grievance Analytics" subtitle="Track your complaint history, status breakdown, and resolution times." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total Filed</span>
                  <h3 style={{ margin: '0.2rem 0', color: '#0f4c81' }}>{stats?.totals?.total || 0}</h3>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>Active Cases</span>
                  <h3 style={{ margin: '0.2rem 0', color: '#2563eb' }}>{(stats?.totals?.pending || 0) + (stats?.totals?.inProgress || 0)}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>In review or work started</span>
                </div>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>Closed Cases</span>
                  <h3 style={{ margin: '0.2rem 0', color: '#16a34a' }}>{stats?.totals?.resolved || 0}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#166534' }}>Successfully resolved</span>
                </div>
                <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700 }}>Avg Resolution Speed</span>
                  <h3 style={{ margin: '0.2rem 0', color: '#9333ea' }}>18.4 hrs</h3>
                  <span style={{ fontSize: '0.75rem', color: '#6b21a8' }}>Average turn-around time</span>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles.sidebarColumn}>
            <div className={styles.widgetCard}>
              <SectionTitle title="Citizen Recognition" subtitle="Your earned badges and civic contribution points." />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ padding: '0.35rem 0.75rem', background: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                  🌟 Active Citizen (+{profile?.points || 45} pts)
                </span>
                <span style={{ padding: '0.35rem 0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                  🙋‍♂️ Community Volunteer
                </span>
                <span style={{ padding: '0.35rem 0.75rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                  👑 Top Contributor
                </span>
              </div>
            </div>

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
