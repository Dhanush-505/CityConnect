import { useEffect, useMemo, useState } from 'react';
import { MdLocationOn, MdThumbUp } from 'react-icons/md';
import styles from '../styles/DashboardPage.module.css';

const baseComplaints = [
  {
    id: 'near-1',
    title: 'Potholes near Park Road',
    category: 'Roads',
    department: 'Public Works',
    status: 'Pending',
    votes: 14,
    date: '2026-07-01',
    location: { lat: 12.9716, lng: 77.5946 },
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'near-2',
    title: 'Street light outage near Civic Center',
    category: 'Street Lights',
    department: 'Electrical',
    status: 'In Progress',
    votes: 9,
    date: '2026-06-29',
    location: { lat: 12.972, lng: 77.596 },
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'near-3',
    title: 'Overflowing drain near Market Lane',
    category: 'Drainage',
    department: 'Drainage',
    status: 'Resolved',
    votes: 21,
    date: '2026-06-26',
    location: { lat: 12.974, lng: 77.592 },
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
  },
];

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function NearbyComplaints() {
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [category, setCategory] = useState('all');
  const [distance, setDistance] = useState('all');
  const [status, setStatus] = useState('all');
  const [supported, setSupported] = useState({});

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {}
    );
  }, []);

  const complaints = useMemo(() => {
    const normalized = baseComplaints.map((complaint) => ({
      ...complaint,
      distanceMeters: calculateDistance(userLocation.lat, userLocation.lng, complaint.location.lat, complaint.location.lng),
    }));

    return normalized
      .filter((complaint) => {
        const matchesSearch = [complaint.title, complaint.category, complaint.department].join(' ').toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = department === 'all' || complaint.department === department;
        const matchesCategory = category === 'all' || complaint.category === category;
        const matchesStatus = status === 'all' || complaint.status === status;
        const matchesDistance = distance === 'all' || complaint.distanceMeters <= Number(distance);
        return matchesSearch && matchesDepartment && matchesCategory && matchesStatus && matchesDistance;
      })
      .sort((a, b) => {
        if (a.distanceMeters !== b.distanceMeters) return a.distanceMeters - b.distanceMeters;
        if (b.votes !== a.votes) return b.votes - a.votes;
        return new Date(b.date) - new Date(a.date);
      });
  }, [category, department, distance, search, status, userLocation.lat, userLocation.lng]);

  const handleSupport = (id) => {
    setSupported((current) => ({ ...current, [id]: true }));
  };

  return (
    <section className={styles.communitySection} aria-label="Nearby community complaints">
      <div className={styles.sectionIntro}>
        <div>
          <h3>Nearby Community Complaints</h3>
          <p>Support community issues to help local authorities identify high-priority problems.</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          className={styles.filterInput}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search title, category or department"
          aria-label="Search nearby complaints"
        />
        <select className={styles.filterSelect} value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Department filter">
          <option value="all">All departments</option>
          <option value="Public Works">Public Works</option>
          <option value="Electrical">Electrical</option>
          <option value="Drainage">Drainage</option>
        </select>
        <select className={styles.filterSelect} value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category filter">
          <option value="all">All categories</option>
          <option value="Roads">Roads</option>
          <option value="Street Lights">Street Lights</option>
          <option value="Drainage">Drainage</option>
        </select>
        <select className={styles.filterSelect} value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status filter">
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select className={styles.filterSelect} value={distance} onChange={(event) => setDistance(event.target.value)} aria-label="Distance filter">
          <option value="all">Any distance</option>
          <option value="1000">Within 1 km</option>
          <option value="3000">Within 3 km</option>
          <option value="5000">Within 5 km</option>
        </select>
      </div>

      {complaints.length === 0 ? (
        <div className={styles.emptyCard}>No community complaints have been reported near your location yet.</div>
      ) : (
        <div className={styles.communityGrid}>
          {complaints.map((complaint) => (
            <article className={styles.communityCard} key={complaint.id}>
              <div className={styles.communityImageWrap}>
                <img src={complaint.imageUrl} alt={complaint.title} className={styles.communityImage} loading="lazy" />
              </div>
              <div className={styles.communityMeta}>
                <div className={styles.communityTopRow}>
                  <span className={styles.statusBadge}>{complaint.status}</span>
                  <span className={styles.distancePill}><MdLocationOn /> {formatDistance(complaint.distanceMeters)}</span>
                </div>
                <h4>{complaint.title}</h4>
                <p>{complaint.category} • {complaint.department}</p>
                <div className={styles.communityFooter}>
                  <span>{new Date(complaint.date).toLocaleDateString()}</span>
                  <span>{complaint.votes + (supported[complaint.id] ? 1 : 0)} supporters</span>
                </div>
                <button type="button" className={styles.supportButton} onClick={() => handleSupport(complaint.id)} disabled={supported[complaint.id]}>
                  <MdThumbUp /> {supported[complaint.id] ? 'Supported' : 'Support this Complaint'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default NearbyComplaints;
