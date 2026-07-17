import styles from '../styles/DashboardComponents.module.css';
import { Button } from '../../components/common';

function ProfileSummaryCard({ profile = {}, summary = {} }) {
  const safeProfile = profile || {};

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatarLarge}>{String(safeProfile.name || 'C')[0]}</div>
        <div>
          <h3>{safeProfile.name || 'Citizen Name'}</h3>
          <p>{safeProfile.email || 'no-email@cityconnect.gov'}</p>
        </div>
      </div>
      <div className={styles.profileDetails}>
        <div>
          <p>Phone</p>
          <strong>{profile.phone || '+91 98765 43210'}</strong>
        </div>
        <div>
          <p>Address</p>
          <strong>{profile.address || 'City Center, Civic Zone'}</strong>
        </div>
        <div>
          <p>Member Since</p>
          <strong>{profile.memberSince || 'Jan 2024'}</strong>
        </div>
      </div>
      <div className={styles.profileMetrics}>
        <div>
          <span>{summary?.total || 0}</span>
          <p>Total Reports</p>
        </div>
        <div>
          <span>{summary?.resolved || 0}</span>
          <p>Resolved</p>
        </div>
      </div>
      <Button variant="primary" size="medium">Edit Profile</Button>
    </div>
  );
}

export default ProfileSummaryCard;
