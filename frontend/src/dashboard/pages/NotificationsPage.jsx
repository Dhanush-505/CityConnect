import { useMemo, useState } from 'react';
import { MdDeleteOutline, MdNotificationsNone, MdSearch } from 'react-icons/md';
import DashboardLayout from '../layout/DashboardLayout';
import styles from '../styles/NotificationsPage.module.css';

const initialNotifications = [
  { id: 1, title: 'Complaint Assigned', description: 'Your road repair request has been assigned to the Public Works team.', time: '10 min ago', unread: true, category: 'Complaint Updates' },
  { id: 2, title: 'Government Announcement', description: 'Water supply will be temporarily paused tomorrow morning.', time: '1 hr ago', unread: false, category: 'Announcements' },
  { id: 3, title: 'Feedback Response', description: 'A city official replied to your recent feedback.', time: '3 hrs ago', unread: true, category: 'Feedback Replies' }
];

function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const visibleNotifications = useMemo(() => notifications.filter((item) => {
    const matchesFilter = filter === 'All' || item.category === filter || (filter === 'Unread' && item.unread);
    const matchesSearch = `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [filter, notifications, search]);

  const markAsRead = (id) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
  };

  const removeNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  return (
    <DashboardLayout profile={{ name: 'Aarav' }} notificationsCount={notifications.filter((item) => item.unread).length}>
      <section className={styles.pageShell}>
        <header className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Portal Updates</p>
            <h1>Notification Center</h1>
            <p>Stay informed about complaint updates, service announcements and feedback response.</p>
          </div>
        </header>

        <section className={styles.toolbar}>
          <label className={styles.searchInput}>
            <MdSearch />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" />
          </label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All</option>
            <option value="Unread">Unread</option>
            <option value="Complaint Updates">Complaint Updates</option>
            <option value="Announcements">Announcements</option>
            <option value="Feedback Replies">Feedback Replies</option>
          </select>
        </section>

        <div className={styles.list}>
          {visibleNotifications.map((item) => (
            <article key={item.id} className={`${styles.notificationCard} ${item.unread ? styles.unread : ''}`}>
              <div className={styles.iconWrap}><MdNotificationsNone /></div>
              <div className={styles.content}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <span className={styles.badge}>{item.category}</span>
                </div>
                <div className={styles.footer}>
                  <span>{item.time}</span>
                  <div className={styles.actions}>
                    {item.unread ? <button type="button" onClick={() => markAsRead(item.id)}>Mark as Read</button> : <span>Read</span>}
                    <button type="button" onClick={() => removeNotification(item.id)}><MdDeleteOutline /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default NotificationsPage;
