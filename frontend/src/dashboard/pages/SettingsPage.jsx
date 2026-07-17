import { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import Button from '../../components/common/Button';
import styles from '../styles/SettingsPage.module.css';

function SettingsPage() {
  const [preferences, setPreferences] = useState({ email: true, sms: false, push: true, announcements: true, feedbackReplies: true, highContrast: false, reduceMotion: false });

  const toggle = (field) => {
    setPreferences((current) => ({ ...current, [field]: !current[field] }));
  };

  return (
    <DashboardLayout profile={{ name: 'Aarav' }} notificationsCount={1}>
      <section className={styles.pageShell}>
        <header className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Control Center</p>
            <h1>Settings</h1>
            <p>Adjust account, privacy, appearance, accessibility and notification preferences.</p>
          </div>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <h2>Account Settings</h2>
            <label className={styles.field}><span>Name</span><input defaultValue="Aarav Reddy" /></label>
            <label className={styles.field}><span>Email</span><input defaultValue="aarav.reddy@email.com" /></label>
            <label className={styles.field}><span>Phone</span><input defaultValue="+91 98765 43210" /></label>
            <Button variant="primary">Save Changes</Button>
          </section>

          <section className={styles.panel}>
            <h2>Notification Preferences</h2>
            {Object.entries({ email: 'Email', sms: 'SMS', push: 'Push Notifications', announcements: 'Announcements', feedbackReplies: 'Feedback Replies' }).map(([key, label]) => (
              <label key={key} className={styles.toggleRow}>
                <input type="checkbox" checked={preferences[key]} onChange={() => toggle(key)} />
                <span>{label}</span>
              </label>
            ))}
          </section>

          <section className={styles.panel}>
            <h2>Privacy</h2>
            <label className={styles.toggleRow}><input type="checkbox" defaultChecked /><span>Hide Phone</span></label>
            <label className={styles.toggleRow}><input type="checkbox" defaultChecked /><span>Hide Email</span></label>
            <label className={styles.toggleRow}><input type="checkbox" /><span>Public Complaint Visibility</span></label>
            <label className={styles.toggleRow}><input type="checkbox" defaultChecked /><span>Location Permission</span></label>
          </section>

          <section className={styles.panel}>
            <h2>Accessibility</h2>
            <label className={styles.toggleRow}><input type="checkbox" checked={preferences.highContrast} onChange={() => toggle('highContrast')} /><span>High Contrast</span></label>
            <label className={styles.toggleRow}><input type="checkbox" defaultChecked /><span>Keyboard Navigation</span></label>
            <label className={styles.toggleRow}><input type="checkbox" defaultChecked /><span>Screen Reader Support</span></label>
            <label className={styles.toggleRow}><input type="checkbox" checked={preferences.reduceMotion} onChange={() => toggle('reduceMotion')} /><span>Reduce Motion</span></label>
          </section>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default SettingsPage;
