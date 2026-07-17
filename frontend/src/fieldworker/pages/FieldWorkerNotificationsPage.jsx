import FieldWorkerLayout from '../components/FieldWorkerLayout';
import styles from '../styles/FieldWorkerNotificationsPage.module.css';

const notifications = [
  { title: 'New task assigned', description: 'CMP-1048 has been assigned to you.', time: '10 min ago', status: 'Unread' },
  { title: 'Admin message', description: 'Please add the latest repair images before closure.', time: '1 hour ago', status: 'Read' },
  { title: 'High priority alert', description: 'CMP-1051 needs urgent attention.', time: '2 hours ago', status: 'Unread' },
];

function FieldWorkerNotificationsPage() {
  return (
    <FieldWorkerLayout>
      <section className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Notifications</p>
            <h1>Workplace updates</h1>
          </div>
        </div>

        <div className={styles.list}>
          {notifications.map((item) => (
            <article key={item.title} className={styles.card}>
              <div>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
              <div className={styles.meta}>
                <span>{item.time}</span>
                <span className={styles.status}>{item.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </FieldWorkerLayout>
  );
}

export default FieldWorkerNotificationsPage;
