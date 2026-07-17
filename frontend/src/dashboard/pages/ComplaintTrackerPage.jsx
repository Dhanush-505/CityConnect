import { useEffect, useMemo, useState } from 'react';
import { MdLocationOn, MdWarning } from 'react-icons/md';
import DashboardLayout from '../layout/DashboardLayout';
import styles from '../styles/ComplaintTrackerPage.module.css';
import axiosInstance from '../../api/axios';
import Timeline from '../../components/Timeline/Timeline';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ComplaintHistory from '../../components/ComplaintHistory/ComplaintHistory';
import TrackingCard from '../../components/TrackingCard/TrackingCard';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import RemarksCard from '../../components/RemarksCard/RemarksCard';
import LocationCard from '../../components/LocationCard/LocationCard';

const getNormalizedStatus = (status) => {
  const s = String(status || '').toLowerCase();
  if (['submitted', 'under review', 'approved'].includes(s)) return 'Pending';
  if (['assigned', 'accepted', 'travelling', 'work started', 'in progress', 'completed', 'waiting verification'].includes(s)) return 'In Progress';
  if (['closed', 'resolved'].includes(s)) return 'Resolved';
  if (['rejected'].includes(s)) return 'Rejected';
  return 'Pending';
};

const calculateProgress = (status) => {
  switch (status) {
    case 'Submitted': return 10;
    case 'Under Review': return 20;
    case 'Approved': return 30;
    case 'Assigned': return 40;
    case 'Accepted': return 50;
    case 'Travelling': return 60;
    case 'Work Started': return 70;
    case 'In Progress': return 80;
    case 'Completed': return 90;
    case 'Waiting Verification': return 90;
    case 'Closed': return 100;
    case 'Rejected': return 0;
    default: return 10;
  }
};

function ComplaintTrackerPage() {
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [profileRes, complaintsRes] = await Promise.all([
        axiosInstance.get('/user/profile'),
        axiosInstance.get('/complaints')
      ]);

      setProfile(profileRes?.data || profileRes || null);
      const items = Array.isArray(complaintsRes) ? complaintsRes : complaintsRes?.items || [];
      setComplaints(items);

      if (items.length > 0) {
        // Default select first or keep existing selected
        setSelectedComplaint((prevSelected) => {
          const exists = prevSelected && items.find((item) => (item._id || item.id) === (prevSelected._id || prevSelected.id));
          return exists || items[0];
        });
      }
    } catch (err) {
      setError(err?.message || 'Failed to load tracking data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll for real-time dashboard sync
  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch timeline whenever selected complaint changes
  useEffect(() => {
    if (selectedComplaint) {
      const fetchTimeline = async () => {
        try {
          const res = await axiosInstance.get(`/complaints/${selectedComplaint._id || selectedComplaint.id}/timeline`);
          setTimelineEntries(res?.data || res || []);
        } catch (err) {
          setTimelineEntries([]);
        }
      };
      fetchTimeline();
    }
  }, [selectedComplaint]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesSearch = [item.complaintId, item.title, item.department, item.category, item.complaintLocation]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      
      const matchesStatus =
        statusFilter === 'All' ||
        item.status === statusFilter ||
        getNormalizedStatus(item.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  const selected = useMemo(() => {
    if (!selectedComplaint) return null;
    return complaints.find(
      (item) => (item._id || item.id) === (selectedComplaint._id || selectedComplaint.id)
    ) || selectedComplaint;
  }, [complaints, selectedComplaint]);

  // Check if deadline is overdue
  const isOverdue = useMemo(() => {
    if (!selected?.expectedCompletionDate) return false;
    const deadline = new Date(selected.expectedCompletionDate);
    const now = new Date();
    return deadline < now && selected.status !== 'Closed' && selected.status !== 'Rejected';
  }, [selected]);

  return (
    <DashboardLayout profile={profile} notificationsCount={0}>
      <section className={styles.pageShell}>
        <header className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Citizen Services</p>
            <h1>Complaint Tracker</h1>
            <p>Monitor the journey of every request from submission to closure in real-time.</p>
          </div>
        </header>

        <section className={styles.toolbar}>
          <label className={styles.searchInput}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by complaint ID, title, department, category or area..."
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading tracking dashboard...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>{error}</div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No complaints filed yet</h3>
            <p>You can track your submitted complaints here once they are registered.</p>
          </div>
        ) : (
          <div className={styles.contentGrid}>
            <div className={styles.listPane}>
              {filteredComplaints.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No complaints match your filters.
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <button
                    key={item._id || item.id || item.complaintId}
                    type="button"
                    className={`${styles.complaintCard} ${
                      selected && (selected._id || selected.id) === (item._id || item.id)
                        ? styles.activeCard
                        : ''
                    }`}
                    onClick={() => setSelectedComplaint(item)}
                  >
                    <div className={styles.cardTop}>
                      <div>
                        <p className={styles.idLabel}>{item.complaintId || 'CMP'}</p>
                        <h3>{item.title}</h3>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <p>{item.complaintLocation || 'No location provided'}</p>
                    <div className={styles.cardMeta}>
                      <span>{item.department}</span>
                      <span>{item.priority}</span>
                      <span>{calculateProgress(item.status)}%</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {selected ? (
              <div className={styles.detailPane}>
                {isOverdue && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#b91c1c',
                    padding: '1rem',
                    borderRadius: '16px',
                    fontWeight: 700
                  }}>
                    <MdWarning style={{ fontSize: '1.5rem', flexShrink: 0 }} />
                    <div>
                      <div>Estimated completion date has passed!</div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        Expected resolution was: {new Date(selected.expectedCompletionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <TrackingCard complaint={selected} />

                <div className={styles.panel}>
                  <ProgressBar progress={calculateProgress(selected.status)} />
                </div>

                <div className={styles.panel}>
                  <h3>Live Timeline</h3>
                  <Timeline currentStatus={selected.status} timelineEntries={timelineEntries} />
                </div>

                <RemarksCard complaint={selected} />

                <div className={styles.panel}>
                  <ImageGallery complaint={selected} />
                </div>

                <div className={styles.panel}>
                  <ComplaintHistory timelineEntries={timelineEntries} />
                </div>

                <LocationCard complaint={selected} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Select a complaint from the list to view its real-time tracking details.
              </div>
            )}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

export default ComplaintTrackerPage;
