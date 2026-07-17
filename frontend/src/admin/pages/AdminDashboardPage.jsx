import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdInbox,
  MdManageAccounts,
  MdTimeline,
  MdGroups,
  MdFeedback,
  MdNotifications,
  MdBarChart,
  MdAnnouncement,
  MdSettings,
  MdPerson,
  MdLogout,
  MdMenu,
  MdSearch,
  MdChevronRight,
  MdWarning,
  MdRefresh
} from 'react-icons/md';
import axiosInstance from '../../api/axios';
import styles from '../styles/AdminDashboardPage.module.css';

// Reusable components
import Timeline from '../../components/Timeline/Timeline';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ComplaintHistory from '../../components/ComplaintHistory/ComplaintHistory';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import RemarksCard from '../../components/RemarksCard/RemarksCard';
import VerificationCard from '../../components/VerificationCard/VerificationCard';
import LocationCard from '../../components/LocationCard/LocationCard';
import MapModal from '../../components/MapModal/MapModal';

const sidebarItems = [
  { label: 'Dashboard', icon: <MdDashboard />, key: 'dashboard' },
  { label: 'Complaint Tracker', icon: <MdTimeline />, key: 'tracker' },
  { label: 'Complaint Inbox', icon: <MdInbox />, key: 'inbox' },
  { label: 'Complaint Management', icon: <MdManageAccounts />, key: 'management' },
  { label: 'Field Officers', icon: <MdGroups />, key: 'officers' },
  { label: 'Citizens', icon: <MdPerson />, key: 'citizens' },
  { label: 'Feedback', icon: <MdFeedback />, key: 'feedback' },
  { label: 'Notifications', icon: <MdNotifications />, key: 'notifications' },
  { label: 'Reports', icon: <MdBarChart />, key: 'reports' },
  { label: 'Analytics', icon: <MdBarChart />, key: 'analytics' },
  { label: 'Announcements', icon: <MdAnnouncement />, key: 'announcements' },
  { label: 'Settings', icon: <MdSettings />, key: 'settings' },
  { label: 'Profile', icon: <MdPerson />, key: 'profile' },
];

const departments = ['All Departments', 'Electricity', 'Water Supply', 'Drainage & Waste Management'];
const statuses = [
  'All Statuses',
  'Submitted',
  'Under Review',
  'Approved',
  'Assigned',
  'Accepted',
  'Travelling',
  'Work Started',
  'In Progress',
  'Completed',
  'Waiting Verification',
  'Closed',
  'Rejected'
];
const priorities = ['All Priorities', 'Low', 'Medium', 'High', 'Critical'];

const normalizeDepartment = (value = '') => {
  if (!value) return '';
  if (value === 'Drainage & Waste' || value === 'Drainage & Waste Management') return 'Drainage & Waste Management';
  return value;
};

const formatRelativeTime = (value) => {
  if (!value) return 'Recently updated';
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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

const VALID_TRANSITIONS = {
  'Submitted': ['Under Review', 'Rejected', 'Approved'],
  'Under Review': ['Approved', 'Rejected'],
  'Approved': ['Assigned', 'Rejected'],
  'Assigned': ['Accepted', 'Travelling'],
  'Accepted': ['Travelling', 'Work Started'],
  'Travelling': ['Work Started'],
  'Work Started': ['In Progress', 'Completed'],
  'In Progress': ['Completed'],
  'Completed': ['Waiting Verification'],
  'Waiting Verification': ['Closed', 'In Progress'],
  'Closed': ['Under Review', 'In Progress', 'Assigned'],
  'Rejected': ['Under Review', 'Approved'],
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [department, setDepartment] = useState('All Departments');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected complaint details in tracker view
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [modalComplaint, setModalComplaint] = useState(null);

  // Tracker Filters
  const [trackerSearch, setTrackerSearch] = useState('');
  const [trackerStatus, setTrackerStatus] = useState('All Statuses');
  const [trackerPriority, setTrackerPriority] = useState('All Priorities');
  const [trackerWorker, setTrackerWorker] = useState('All Workers');
  const [trackerCitizen, setTrackerCitizen] = useState('');
  const [trackerDate, setTrackerDate] = useState('');

  // Quick Action form states
  const [statusRemark, setStatusRemark] = useState('');
  const [reassignWorkerId, setReassignWorkerId] = useState('');
  const [reassignRemarks, setReassignRemarks] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [complaintsRes, usersRes] = await Promise.all([
        axiosInstance.get('/admin/complaints'),
        axiosInstance.get('/users')
      ]);

      const items = Array.isArray(complaintsRes) ? complaintsRes : complaintsRes?.data || [];
      setComplaints(items);

      const allUsers = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
      setUsers(allUsers);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load administration data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const authorized = localStorage.getItem('cityconnect-admin-auth');
    if (authorized !== 'true') {
      navigate('/admin/login');
      return;
    }

    loadData();

    // Poll every 5s for real-time synchronization
    const interval = setInterval(() => {
      loadData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Load timeline details when selected complaint changes
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

  // Filtered workers list
  const fieldWorkers = useMemo(() => {
    return users.filter((u) => u.role === 'field_worker');
  }, [users]);

  // Sync selected complaint reference
  const selected = useMemo(() => {
    if (!selectedComplaint) return null;
    return complaints.find(
      (c) => (c._id || c.id) === (selectedComplaint._id || selectedComplaint.id)
    ) || selectedComplaint;
  }, [complaints, selectedComplaint]);

  // Overdue status check
  const isOverdue = useMemo(() => {
    if (!selected?.expectedCompletionDate) return false;
    return new Date(selected.expectedCompletionDate) < new Date() && selected.status !== 'Closed' && selected.status !== 'Rejected';
  }, [selected]);

  // Dashboard calculations
  const filteredComplaints = useMemo(() => {
    const selectedDepartment = normalizeDepartment(department);
    if (!selectedDepartment || department === 'All Departments') return complaints;
    return complaints.filter((item) => normalizeDepartment(item.department) === selectedDepartment);
  }, [complaints, department]);

  const stats = useMemo(() => {
    const total = filteredComplaints.length;
    const newToday = filteredComplaints.filter((item) => {
      if (!item.createdAt) return false;
      const createdAt = new Date(item.createdAt).getTime();
      return Date.now() - createdAt < 24 * 60 * 60 * 1000;
    }).length;
    const pending = filteredComplaints.filter((item) => ['Submitted', 'Under Review', 'Approved', 'Assigned', 'Accepted', 'In Progress', 'Waiting Verification'].includes(item.status)).length;
    const resolved = filteredComplaints.filter((item) => ['Resolved', 'Closed'].includes(item.status)).length;
    const highPriority = filteredComplaints.filter((item) => item.priority === 'High' || item.priority === 'Critical').length;
    const activeOfficers = new Set(filteredComplaints.filter((item) => item.assignedFieldWorker).map((item) => item.assignedFieldWorker?._id || item.assignedFieldWorker)).size;

    return [
      { label: 'Total Complaints', value: String(total), detail: department === 'All Departments' ? 'Across all departments' : `${department} requests` },
      { label: 'New Today', value: String(newToday), detail: 'Fresh submissions' },
      { label: 'Pending', value: String(pending), detail: 'Awaiting action' },
      { label: 'Resolved', value: String(resolved), detail: 'Closed successfully' },
      { label: 'High Priority', value: String(highPriority), detail: 'Immediate attention' },
      { label: 'Active Officers', value: String(activeOfficers), detail: 'On field duty' },
    ];
  }, [department, filteredComplaints]);

  const recentComplaints = useMemo(() => {
    return [...filteredComplaints]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6)
      .map((item) => ({
        id: item.complaintId || item._id,
        citizen: item.citizenId?.name || item.citizenName || 'Citizen',
        title: item.title || 'Complaint',
        department: item.department || 'General',
        priority: item.priority || 'Medium',
        status: item.status || 'Submitted',
        time: formatRelativeTime(item.createdAt),
        rawObject: item
      }));
  }, [filteredComplaints]);

  // Admin Tracker Filters
  const trackerFilteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const citizenName = item.citizenId?.name || item.citizenName || '';
      
      const matchesSearch = [item.complaintId, item.title, item.department, item.category]
        .join(' ')
        .toLowerCase()
        .includes(trackerSearch.toLowerCase());
      
      const matchesDept = department === 'All Departments' || normalizeDepartment(item.department) === normalizeDepartment(department);
      const matchesStatus = trackerStatus === 'All Statuses' || item.status === trackerStatus;
      const matchesPriority = trackerPriority === 'All Priorities' || item.priority === trackerPriority;
      
      const matchesWorker = trackerWorker === 'All Workers' || 
        (item.assignedFieldWorker && (item.assignedFieldWorker._id === trackerWorker || item.assignedFieldWorker === trackerWorker));

      const matchesCitizen = !trackerCitizen || citizenName.toLowerCase().includes(trackerCitizen.toLowerCase());

      const matchesDate = !trackerDate || (item.createdAt && new Date(item.createdAt).toDateString() === new Date(trackerDate).toDateString());

      return matchesSearch && matchesDept && matchesStatus && matchesPriority && matchesWorker && matchesCitizen && matchesDate;
    });
  }, [complaints, trackerSearch, department, trackerStatus, trackerPriority, trackerWorker, trackerCitizen, trackerDate]);

  // Actions
  const handleVerify = async (approved, notes) => {
    if (!selected) return;
    try {
      await axiosInstance.put(`/admin/complaints/${selected._id || selected.id}/verify`, { approved, remarks: notes });
      await loadData();
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selected) return;
    try {
      await axiosInstance.put(`/complaints/${selected._id || selected.id}/status`, { status: newStatus, remarks: statusRemark });
      setStatusRemark('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!selected || !reassignWorkerId) return;
    try {
      await axiosInstance.put(`/admin/complaints/${selected._id || selected.id}/assign`, {
        workerId: reassignWorkerId,
        remarks: reassignRemarks,
        expectedCompletionDate: expectedDate || undefined
      });
      setReassignWorkerId('');
      setReassignRemarks('');
      setExpectedDate('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Assignment failed.');
    }
  };

  const handleReopen = async () => {
    if (!selected) return;
    try {
      await axiosInstance.put(`/admin/complaints/${selected._id || selected.id}/reopen`, { remarks: 'Reopened by Administrator' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Reopening complaint failed.');
    }
  };

  return (
    <div className={styles.adminShell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div>
            <p className={styles.brandLabel}>CityConnect</p>
            <p className={styles.brandTag}>Municipal Admin</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><MdMenu /></button>
        </div>
        <nav className={styles.navList}>
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.navItem} ${activeTab === item.key ? styles.activeNavItem || styles.activeCard : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logoutButton} onClick={() => { localStorage.removeItem('authToken'); localStorage.removeItem('cityconnect-user'); localStorage.removeItem('cityconnect-admin-auth'); navigate('/admin/login'); }}><MdLogout /> Logout</button>
        </div>
      </aside>

      <div className={styles.contentArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button type="button" className={styles.menuButton} onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><MdMenu /></button>
            <div>
              <p className={styles.eyebrow}>Municipal Command Center</p>
              <h1>Admin Command Panel</h1>
            </div>
          </div>
          <div className={styles.topbarRight}>
            <label className={styles.selectWrap}>
              <span>Department Filter</span>
              <select value={department} onChange={(event) => setDepartment(event.target.value)}>
                {departments.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <button type="button" className={styles.iconButton} onClick={() => loadData()} title="Refresh Data"><MdRefresh /></button>
            <button type="button" className={styles.profileChip}>AM</button>
          </div>
        </header>

        <main className={styles.mainGrid}>
          {activeTab === 'dashboard' && (
            <>
              <section className={styles.heroCard}>
                <div>
                  <p className={styles.eyebrow}>City Operations</p>
                  <h2>Monitor civic requests across the city</h2>
                  <p>Switch departments instantly and manage service delivery from one unified admin control center.</p>
                </div>
                <button type="button" className={styles.primaryButton} onClick={() => setActiveTab('tracker')}>Go to Tracker Workspace</button>
              </section>

              <section className={styles.cardsGrid}>
                {stats.map((card) => (
                  <article key={card.label} className={styles.statCard}>
                    <p>{card.label}</p>
                    <h3>{card.value}</h3>
                    <span>{card.detail}</span>
                  </article>
                ))}
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.eyebrow}>Live Queue</p>
                    <h3>Recent Complaint Feed</h3>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={() => setActiveTab('tracker')}>View All in Tracker</button>
                </div>
                <div className={styles.tableWrap}>
                  {loading ? (
                    <p>Loading complaints…</p>
                  ) : error ? (
                    <p style={{ color: '#ef4444' }}>{error}</p>
                  ) : recentComplaints.length === 0 ? (
                    <p>No complaints found for this selection.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Complaint ID</th>
                          <th>Citizen</th>
                          <th>Department</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentComplaints.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.citizen}</td>
                            <td>{item.department}</td>
                            <td>
                              <button
                                type="button"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#0f4c81',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontWeight: 700,
                                  textAlign: 'left',
                                  fontSize: '0.85rem'
                                }}
                                onClick={() => setModalComplaint(item.rawObject)}
                              >
                                {item.rawObject.location?.address || item.rawObject.complaintLocation || 'View Map'}
                              </button>
                            </td>
                            <td>
                              <StatusBadge status={item.status} />
                            </td>
                            <td>
                              <button
                                type="button"
                                className={styles.textButton}
                                onClick={() => {
                                  setSelectedComplaint(item.rawObject);
                                  setActiveTab('tracker');
                                }}
                              >
                                Track <MdChevronRight />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 'tracker' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', width: '100%', alignItems: 'start' }}>
              
              {/* Tracker Left Pane: List & Filters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className={styles.panel} style={{ padding: '1.2rem' }}>
                  <h3>Search & Advanced Filters</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Search Keyword</span>
                      <input
                        value={trackerSearch}
                        onChange={(e) => setTrackerSearch(e.target.value)}
                        placeholder="Search ID, title, area..."
                        style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Status</span>
                      <select
                        value={trackerStatus}
                        onChange={(e) => setTrackerStatus(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Priority</span>
                      <select
                        value={trackerPriority}
                        onChange={(e) => setTrackerPriority(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      >
                        {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Assigned Worker</span>
                      <select
                        value={trackerWorker}
                        onChange={(e) => setTrackerWorker(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      >
                        <option value="All Workers">All Workers</option>
                        {fieldWorkers.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                      </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Citizen Name</span>
                      <input
                        value={trackerCitizen}
                        onChange={(e) => setTrackerCitizen(e.target.value)}
                        placeholder="Citizen name..."
                        style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Date Created</span>
                      <input
                        type="date"
                        value={trackerDate}
                        onChange={(e) => setTrackerDate(e.target.value)}
                        style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3>Queue ({trackerFilteredComplaints.length})</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
                    {trackerFilteredComplaints.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#64748b' }}>No complaints match filters.</p>
                    ) : (
                      trackerFilteredComplaints.map((item) => (
                        <div
                          key={item._id || item.id}
                          onClick={() => setSelectedComplaint(item)}
                          style={{
                            padding: '0.85rem',
                            borderRadius: '12px',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            background: selected && (selected._id || selected.id) === (item._id || item.id) ? '#eff6ff' : '#ffffff',
                            borderColor: selected && (selected._id || selected.id) === (item._id || item.id) ? '#2563eb' : '#cbd5e1',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>#{item.complaintId}</span>
                            <h4 style={{ margin: '0.2rem 0', color: '#0f172a' }}>{item.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                              Worker: {item.assignedFieldWorker?.name || 'Unassigned'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                            <StatusBadge status={item.status} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f4c81' }}>{calculateProgress(item.status)}%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Tracker Right Pane: Detailed Tracking Workspace */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selected ? (
                  <>
                    {/* Overdue Warning */}
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
                          <div>Overdue Target Resolution Date!</div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            Expected: {new Date(selected.expectedCompletionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Basic details */}
                    <div className={styles.panel}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>#{selected.complaintId}</span>
                        <StatusBadge status={selected.status} />
                      </div>
                      <h2 style={{ color: '#0f172a', margin: '0.5rem 0' }}>{selected.title}</h2>
                      <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>{selected.description}</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><strong>Citizen:</strong> {selected.citizenId?.name || selected.citizenName || 'N/A'}</div>
                        <div><strong>Contact:</strong> {selected.citizenId?.phone || selected.contactNumber || 'N/A'}</div>
                        <div><strong>Department:</strong> {selected.department}</div>
                        <div><strong>Priority:</strong> {selected.priority}</div>
                      </div>
                    </div>

                    <LocationCard complaint={selected} />

                    {/* Progress Bar */}
                    <div className={styles.panel}>
                      <ProgressBar progress={calculateProgress(selected.status)} />
                    </div>

                    {/* Verify Completion */}
                    <VerificationCard complaint={selected} onVerify={handleVerify} />

                    {/* Timeline Tracker */}
                    <div className={styles.panel}>
                      <h3>Timeline Progress</h3>
                      <Timeline currentStatus={selected.status} timelineEntries={timelineEntries} />
                    </div>

                    {/* Change Status & Reassign panel */}
                    <div className={styles.panel}>
                      <h3>Workflow Control Engine</h3>
                      
                      {/* Change Status */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Change Status Manually</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleStatusChange(e.target.value);
                              e.target.value = '';
                            }}
                            defaultValue=""
                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                          >
                            <option value="" disabled>Select allowed status...</option>
                            {statuses
                              .filter(s => s !== 'All Statuses' && VALID_TRANSITIONS[selected.status]?.includes(s))
                              .map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <input
                          value={statusRemark}
                          onChange={(e) => setStatusRemark(e.target.value)}
                          placeholder="Optional status remarks..."
                          style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                        />
                      </div>

                      {/* Reassignment form */}
                      <form onSubmit={handleReassign} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Reassign Field Worker</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <select
                            value={reassignWorkerId}
                            onChange={(e) => setReassignWorkerId(e.target.value)}
                            required
                            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                          >
                            <option value="">Select Worker...</option>
                            {fieldWorkers.map((w) => <option key={w._id} value={w._id}>{w.name} ({w.department || 'General'})</option>)}
                          </select>

                          <input
                            type="date"
                            value={expectedDate}
                            onChange={(e) => setExpectedDate(e.target.value)}
                            title="Expected Completion Date"
                            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                          />
                        </div>
                        <input
                          value={reassignRemarks}
                          onChange={(e) => setReassignRemarks(e.target.value)}
                          placeholder="Assignment instructions/remarks..."
                          style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                        />
                        <button type="submit" style={{ background: '#0f4c81', color: '#ffffff', border: 'none', padding: '0.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                          Reassign Worker
                        </button>
                      </form>

                      {/* Reopen Action */}
                      {(selected.status === 'Closed' || selected.status === 'Rejected') && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                          <button
                            type="button"
                            onClick={handleReopen}
                            style={{ width: '100%', background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Reopen Complaint
                          </button>
                        </div>
                      )}
                    </div>

                    <RemarksCard complaint={selected} />

                    <div className={styles.panel}>
                      <ImageGallery complaint={selected} />
                    </div>

                    <div className={styles.panel}>
                      <ComplaintHistory timelineEntries={timelineEntries} />
                    </div>
                  </>
                ) : (
                  <div className={styles.panel} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Select a complaint from the left queue to view and manage its real-time workflow.
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>

      <MapModal
        isOpen={!!modalComplaint}
        onClose={() => setModalComplaint(null)}
        latitude={modalComplaint?.location?.latitude ?? modalComplaint?.latitude}
        longitude={modalComplaint?.location?.longitude ?? modalComplaint?.longitude}
        address={modalComplaint?.location?.address ?? modalComplaint?.complaintLocation}
        landmark={modalComplaint?.location?.landmark ?? modalComplaint?.landmark}
      />
    </div>
  );
}

export default AdminDashboardPage;
