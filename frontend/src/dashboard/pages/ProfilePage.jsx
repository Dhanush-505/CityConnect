import { useMemo, useState } from 'react';
import { MdBadge, MdCameraAlt, MdLockOutline, MdPersonOutline, MdShield, MdVerifiedUser } from 'react-icons/md';
import DashboardLayout from '../layout/DashboardLayout';
import Button from '../../components/common/Button';
import styles from '../styles/ProfilePage.module.css';

const initialProfile = {
  firstName: 'Aarav',
  lastName: 'Reddy',
  email: 'aarav.reddy@email.com',
  phone: '+91 98765 43210',
  gender: 'Male',
  dob: '1992-05-14',
  address: '12, Civic Colony, Hitech City',
  pincode: '500081',
  city: 'Hyderabad',
  state: 'Telangana',
  citizenId: 'CC-48291',
  memberSince: 'January 2024',
  status: 'Verified',
  avatar: ''
};

function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [avatarPreview, setAvatarPreview] = useState('');

  const completion = useMemo(() => {
    const values = [profile.firstName, profile.lastName, profile.email, profile.phone, profile.gender, profile.dob, profile.address, profile.city, profile.state, profile.pincode];
    const filled = values.filter(Boolean).length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const missingFields = useMemo(() => {
    const suggestions = [];
    if (!profile.phone) suggestions.push('Add your phone number');
    if (!profile.dob) suggestions.push('Add your date of birth');
    if (!profile.address) suggestions.push('Add your address');
    if (!profile.pincode) suggestions.push('Add your pincode');
    return suggestions;
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  return (
    <DashboardLayout profile={profile} notificationsCount={3}>
      <section className={styles.pageShell}>
        <header className={styles.heroCard}>
          <div className={styles.heroInfo}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarLarge}>{profile.firstName?.charAt(0) || 'C'}</div>
              <label className={styles.uploadButton} htmlFor="avatar-upload">
                <MdCameraAlt />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </div>
            <div>
              <div className={styles.badgeRow}>
                <h1>{profile.firstName} {profile.lastName}</h1>
                <span className={styles.statusBadge}><MdVerifiedUser /> Verified</span>
              </div>
              <p className={styles.metaText}>Citizen ID: {profile.citizenId}</p>
              <p className={styles.metaText}>{profile.email}</p>
              <p className={styles.metaText}>{profile.phone} • {profile.city}, {profile.state}</p>
              <p className={styles.metaText}>Member since {profile.memberSince}</p>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button variant="primary">Edit Profile</Button>
            <Button variant="secondary">Change Password</Button>
          </div>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.leftColumn}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Personal Information</h2>
                <span className={styles.eyebrow}>Editable</span>
              </div>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>First Name</span>
                  <input name="firstName" value={profile.firstName} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>Last Name</span>
                  <input name="lastName" value={profile.lastName} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>Email</span>
                  <input name="email" type="email" value={profile.email} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>Phone</span>
                  <input name="phone" value={profile.phone} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>Gender</span>
                  <select name="gender" value={profile.gender} onChange={handleChange}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Date of Birth</span>
                  <input name="dob" type="date" value={profile.dob} onChange={handleChange} />
                </label>
                <label className={styles.fieldWide}>
                  <span>Address</span>
                  <textarea name="address" rows="3" value={profile.address} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>Pincode</span>
                  <input name="pincode" value={profile.pincode} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>City</span>
                  <input name="city" value={profile.city} onChange={handleChange} />
                </label>
                <label className={styles.field}>
                  <span>State</span>
                  <input name="state" value={profile.state} onChange={handleChange} />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Upload Profile Picture</h2>
                <span className={styles.eyebrow}>Camera / Gallery</span>
              </div>
              <div className={styles.uploadArea}>
                {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className={styles.previewImage} /> : <div className={styles.previewPlaceholder}><MdPersonOutline size={36} /></div>}
                <p>Drag and drop or select a photo from your device to refresh your profile image.</p>
                <label className={styles.uploadInput} htmlFor="avatar-upload-inline">
                  <MdCameraAlt /> Upload photo
                </label>
                <input id="avatar-upload-inline" type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </div>
            </section>
          </div>

          <div className={styles.rightColumn}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Account Information</h2>
              </div>
              <div className={styles.metricsGrid}>
                {[
                  ['Registered Date', '12 Jan 2024'],
                  ['Last Login', '2 hrs ago'],
                  ['Total Complaints', '24'],
                  ['Resolved', '18'],
                  ['Pending', '4'],
                  ['Escalated', '2']
                ].map(([label, value]) => (
                  <div key={label} className={styles.metricCard}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Profile Completion</h2>
                <span className={styles.eyebrow}>{completion}%</span>
              </div>
              <div className={styles.progressBar}><div style={{ width: `${completion}%` }} /></div>
              <p className={styles.progressCopy}>Your profile is almost complete. Add the missing fields to improve service requests.</p>
              <ul className={styles.suggestionList}>
                {missingFields.length > 0 ? missingFields.map((item) => <li key={item}>{item}</li>) : <li>Your profile is complete.</li>}
              </ul>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Security</h2>
              </div>
              <div className={styles.securityList}>
                <div className={styles.securityItem}><MdLockOutline /><span>Change Password</span></div>
                <div className={styles.securityItem}><MdShield /><span>Enable Two-Factor Authentication</span></div>
                <div className={styles.securityItem}><MdBadge /><span>Login Activity</span></div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default ProfilePage;
