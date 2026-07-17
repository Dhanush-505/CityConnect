import FieldWorkerLayout from '../components/FieldWorkerLayout';
import styles from '../styles/FieldWorkerSettingsPage.module.css';

function FieldWorkerSettingsPage() {
  return (
    <FieldWorkerLayout>
      <section className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Settings</p>
            <h1>Preferences and access</h1>
          </div>
        </div>

        <div className={styles.card}>
          <h2>General</h2>
          <ul>
            <li>Theme: System</li>
            <li>Language: English</li>
            <li>Notifications: Enabled</li>
            <li>Location permission: Allowed</li>
          </ul>
        </div>
      </section>
    </FieldWorkerLayout>
  );
}

export default FieldWorkerSettingsPage;
