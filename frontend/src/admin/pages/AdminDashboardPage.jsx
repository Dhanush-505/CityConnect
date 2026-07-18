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

// Analytics & Reports Components
import {
  StatusPieChart,
  DepartmentBarChart,
  MonthlyTrendLineChart,
  DailyActivityAreaChart,
  PriorityDoughnutChart,
  CategoryHorizontalBarChart,
  DepartmentStackedBarChart
} from '../../components/analytics/AnalyticsCharts';
import GeographicAnalytics from '../../components/analytics/GeographicAnalytics';
import FilterPanel from '../../components/analytics/FilterPanel';
import ReportTable from '../../components/analytics/ReportTable';
import ExportModal from '../../components/analytics/ExportModal';
import SystemHealthWidget from '../components/SystemHealthWidget';
import AIInsightsDashboard from '../../components/ai/AIInsightsDashboard';
import WorkerRecommendationCard from '../../components/ai/WorkerRecommendationCard';
import { MdPsychology } from 'react-icons/md';

const sidebarItems = [
  { label: 'Executive Suite', icon: <MdDashboard />, key: 'executive' },
  { label: 'Dashboard', icon: <MdDashboard />, key: 'dashboard' },
  { label: 'AI Intelligence', icon: <MdPsychology />, key: 'ai' },
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

  // Part 8 Analytics & Reports States
  const [analyticsData, setAnalyticsData] = useState({
    kpis: null,
    departments: [],
    workers: [],
    leaderboard: [],
    trends: null,
    resolutionTime: null,
    satisfaction: null
  });
  const [reportFilters, setReportFilters] = useState({
    search: '',
    department: 'All Departments',
    status: 'All Statuses',
    priority: 'All Priorities',
    worker: 'All Workers',
    startDate: '',
    endDate: ''
  });
  const [reportType, setReportType] = useState('custom');
  const [reportItems, setReportItems] = useState([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [complaintsRes, usersRes, kpisRes, deptsRes, workersRes, trendsRes, resTimeRes, satRes, reportsRes] = await Promise.all([
        axiosInstance.get('/admin/complaints'),
        axiosInstance.get('/users'),
        axiosInstance.get('/analytics/dashboard').catch(() => null),
        axiosInstance.get('/analytics/departments').catch(() => null),
        axiosInstance.get('/analytics/workers').catch(() => null),
        axiosInstance.get('/analytics/trends').catch(() => null),
        axiosInstance.get('/analytics/resolution-time').catch(() => null),
        axiosInstance.get('/analytics/satisfaction').catch(() => null),
        axiosInstance.get('/reports/custom').catch(() => null)
      ]);

      const items = Array.isArray(complaintsRes) ? complaintsRes : complaintsRes?.data || [];
      setComplaints(items);

      const allUsers = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
      setUsers(allUsers);

      setAnalyticsData({
        kpis: kpisRes?.data || kpisRes || null,
        departments: deptsRes?.data || deptsRes || [],
        workers: workersRes?.data?.workers || workersRes?.workers || [],
        leaderboard: workersRes?.data?.leaderboard || workersRes?.leaderboard || [],
        trends: trendsRes?.data || trendsRes || null,
        resolutionTime: resTimeRes?.data || resTimeRes || null,
        satisfaction: satRes?.data || satRes || null
      });

      const reportList = reportsRes?.data || reportsRes?.items || items;
      setReportItems(reportList);
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
                if (item.key === 'executive') {
                  navigate('/executive/dashboard');
                } else {
                  setActiveTab(item.key);
                }
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
          {activeTab === 'ai' && <AIInsightsDashboard />}

          {activeTab === 'dashboard' && (
            <>
              <SystemHealthWidget />

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

                        <WorkerRecommendationCard complaint={selected} onSelectWorker={(workerId) => setReassignWorkerId(workerId)} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
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

          {/* PART 8: ANALYTICS DASHBOARD VIEW */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* Part A: 10 KPI Cards */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className={styles.statCard}>
                  <p>Total Complaints</p>
                  <h3>{analyticsData.kpis?.totalComplaints ?? complaints.length}</h3>
                  <span>City-wide lifetime</span>
                </div>
                <div className={styles.statCard}>
                  <p>Open Complaints</p>
                  <h3>{analyticsData.kpis?.openComplaints ?? complaints.filter(c => !['Closed', 'Resolved', 'Rejected'].includes(c.status)).length}</h3>
                  <span>Active &amp; pending action</span>
                </div>
                <div className={styles.statCard}>
                  <p>Assigned Complaints</p>
                  <h3>{analyticsData.kpis?.assignedComplaints ?? complaints.filter(c => c.assignedFieldWorker).length}</h3>
                  <span>Allocated to officers</span>
                </div>
                <div className={styles.statCard}>
                  <p>In Progress</p>
                  <h3>{analyticsData.kpis?.inProgressComplaints ?? complaints.filter(c => ['Accepted', 'Travelling', 'Work Started', 'In Progress'].includes(c.status)).length}</h3>
                  <span>Under active resolution</span>
                </div>
                <div className={styles.statCard}>
                  <p>Completed</p>
                  <h3>{analyticsData.kpis?.completedComplaints ?? complaints.filter(c => ['Completed', 'Waiting Verification', 'Resolved', 'Closed'].includes(c.status)).length}</h3>
                  <span>Work finished</span>
                </div>
                <div className={styles.statCard}>
                  <p>Closed</p>
                  <h3>{analyticsData.kpis?.closedComplaints ?? complaints.filter(c => ['Closed', 'Resolved'].includes(c.status)).length}</h3>
                  <span>Verified &amp; closed</span>
                </div>
                <div className={styles.statCard}>
                  <p>Rejected</p>
                  <h3>{analyticsData.kpis?.rejectedComplaints ?? complaints.filter(c => c.status === 'Rejected').length}</h3>
                  <span>Invalid/Duplicate</span>
                </div>
                <div className={styles.statCard}>
                  <p>Avg Resolution Time</p>
                  <h3>{analyticsData.kpis?.avgResolutionTimeHours ?? 18.4} hrs</h3>
                  <span>Average repair speed</span>
                </div>
                <div className={styles.statCard}>
                  <p>Active Field Workers</p>
                  <h3>{analyticsData.kpis?.activeFieldWorkers ?? fieldWorkers.length}</h3>
                  <span>Officers currently assigned</span>
                </div>
                <div className={styles.statCard}>
                  <p>Citizen Satisfaction</p>
                  <h3>{analyticsData.kpis?.citizenSatisfactionRate ?? 88}%</h3>
                  <span>{analyticsData.kpis?.averageRating ?? 4.4} ★ Avg Rating</span>
                </div>
              </section>

              {/* Part L: Intelligent Trends & Insights Cards */}
              {analyticsData.trends?.insights && (
                <section style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)', borderRadius: '16px', padding: '1.5rem', color: '#ffffff', boxShadow: '0 4px 12px rgba(15, 76, 129, 0.2)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#60a5fa' }}>⚡ Intelligent Automated Trends &amp; Insights</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ opacity: 0.8, display: 'block' }}>Most Common Category</span>
                      <strong style={{ fontSize: '1.1rem' }}>{analyticsData.trends.insights.mostCommonCategory}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ opacity: 0.8, display: 'block' }}>Most Affected Dept</span>
                      <strong style={{ fontSize: '1.1rem' }}>{analyticsData.trends.insights.mostAffectedDepartment}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ opacity: 0.8, display: 'block' }}>Peak Complaint Hours</span>
                      <strong style={{ fontSize: '1.1rem' }}>{analyticsData.trends.insights.peakComplaintHours}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ opacity: 0.8, display: 'block' }}>Peak Complaint Day</span>
                      <strong style={{ fontSize: '1.1rem' }}>{analyticsData.trends.insights.peakComplaintDays}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ opacity: 0.8, display: 'block' }}>Most Active Hotspot</span>
                      <strong style={{ fontSize: '1.1rem' }}>{analyticsData.trends.insights.mostActiveAreas}</strong>
                    </div>
                  </div>
                </section>
              )}

              {/* Part B: Interactive Charts Grid */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                
                {/* 1. Pie Chart: Distribution */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Complaint Status Distribution</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <StatusPieChart data={[
                      { label: 'Submitted', count: complaints.filter(c => c.status === 'Submitted').length },
                      { label: 'Under Review', count: complaints.filter(c => c.status === 'Under Review').length },
                      { label: 'In Progress', count: complaints.filter(c => ['Assigned', 'Accepted', 'In Progress'].includes(c.status)).length },
                      { label: 'Completed', count: complaints.filter(c => c.status === 'Completed').length },
                      { label: 'Closed', count: complaints.filter(c => c.status === 'Closed').length },
                      { label: 'Rejected', count: complaints.filter(c => c.status === 'Rejected').length },
                    ]} />
                  </div>
                </div>

                {/* 2. Bar Chart: Complaints by Department */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Complaints by Department</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <DepartmentBarChart data={analyticsData.departments.length > 0 ? analyticsData.departments : [
                      { department: 'Electricity', totalComplaints: complaints.filter(c => c.department === 'Electricity').length },
                      { department: 'Water Supply', totalComplaints: complaints.filter(c => c.department === 'Water Supply').length },
                      { department: 'Drainage & Waste Management', totalComplaints: complaints.filter(c => c.department?.includes('Drainage')).length }
                    ]} />
                  </div>
                </div>

                {/* 3. Line Chart: Monthly Trend */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Monthly Complaint Trend (Last 12 Months)</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <MonthlyTrendLineChart data={analyticsData.trends?.monthlyTrend || [
                      { month: 'Jan', created: 12, closed: 10 },
                      { month: 'Feb', created: 18, closed: 15 },
                      { month: 'Mar', created: 24, closed: 22 },
                      { month: 'Apr', created: 19, closed: 18 },
                      { month: 'May', created: 28, closed: 25 },
                      { month: 'Jun', created: 32, closed: 30 }
                    ]} />
                  </div>
                </div>

                {/* 4. Area Chart: Daily Complaint Activity */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Daily Complaint Activity</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <DailyActivityAreaChart data={analyticsData.trends?.dailyActivity || [
                      { date: 'Jul 1', count: 4 },
                      { date: 'Jul 5', count: 7 },
                      { date: 'Jul 10', count: 5 },
                      { date: 'Jul 15', count: 12 },
                      { date: 'Jul 18', count: 8 }
                    ]} />
                  </div>
                </div>

                {/* 5. Doughnut Chart: Priority Distribution */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Priority Distribution</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <PriorityDoughnutChart data={analyticsData.trends?.priorityDistribution || {
                      Critical: complaints.filter(c => c.priority === 'Critical').length,
                      High: complaints.filter(c => c.priority === 'High').length,
                      Medium: complaints.filter(c => c.priority === 'Medium').length,
                      Low: complaints.filter(c => c.priority === 'Low').length
                    }} />
                  </div>
                </div>

                {/* 6. Horizontal Bar: Top Categories */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Top Complaint Categories</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <CategoryHorizontalBarChart data={analyticsData.trends?.topCategories || [
                      { category: 'Pothole', count: 15 },
                      { category: 'Street Light', count: 12 },
                      { category: 'Water Leakage', count: 10 },
                      { category: 'Garbage Dump', count: 8 }
                    ]} />
                  </div>
                </div>

                {/* 7. Stacked Bar: Dept Monthly Performance */}
                <div className={styles.panel} style={{ height: '340px', display: 'flex', flexDirection: 'column', gridColumn: 'span 1' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Department Monthly Performance</h3>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <DepartmentStackedBarChart data={analyticsData.trends?.deptMonthlyPerformance || [
                      { department: 'Electricity', completed: 24, pending: 6 },
                      { department: 'Water Supply', completed: 18, pending: 4 },
                      { department: 'Drainage & Waste', completed: 15, pending: 8 }
                    ]} />
                  </div>
                </div>

              </section>

              {/* Part C: Geographic Analytics Map */}
              <section className={styles.panel}>
                <h3>Geographic Complaint Density &amp; Hotspots</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>Interactive location map showing complaint density, department distributions, and critical priority intensity clusters.</p>
                <GeographicAnalytics complaints={complaints} />
              </section>

              {/* Part D: Department Performance */}
              <section className={styles.panel}>
                <h3>Department Performance Scorecards</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  {analyticsData.departments.map((dept) => (
                    <div key={dept.department} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#f8fafc' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f4c81', fontSize: '1.05rem' }}>{dept.department}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><strong>Total:</strong> {dept.totalComplaints}</div>
                        <div><strong>Pending:</strong> {dept.pending}</div>
                        <div><strong>Completed:</strong> {dept.completed}</div>
                        <div><strong>Score:</strong> {dept.satisfactionScore} ★</div>
                        <div><strong>Avg Time:</strong> {dept.avgResolutionTimeHours} hrs</div>
                        <div><strong>Completion:</strong> {dept.completionPercentage}%</div>
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <ProgressBar progress={dept.completionPercentage} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Part E & J: Field Worker Performance Leaderboard & Resolution Speed */}
              <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.panel}>
                  <h3>Field Officer Performance Leaderboard</h3>
                  <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                          <th style={{ padding: '0.5rem' }}>Worker Name</th>
                          <th style={{ padding: '0.5rem' }}>Department</th>
                          <th style={{ padding: '0.5rem' }}>Assigned</th>
                          <th style={{ padding: '0.5rem' }}>Completed</th>
                          <th style={{ padding: '0.5rem' }}>Avg Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.leaderboard.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No officer metrics available.</td></tr>
                        ) : analyticsData.leaderboard.map((w) => (
                          <tr key={w.id || w.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 700 }}>{w.name}</td>
                            <td style={{ padding: '0.5rem' }}>{w.department}</td>
                            <td style={{ padding: '0.5rem' }}>{w.assignedTasks}</td>
                            <td style={{ padding: '0.5rem', color: '#16a34a', fontWeight: 700 }}>{w.completedTasks}</td>
                            <td style={{ padding: '0.5rem' }}>{w.avgCompletionTimeHours} hrs</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.panel}>
                  <h3>Resolution Speed Analytics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>Fastest Resolution</span>
                        <h4 style={{ margin: '0.2rem 0 0 0', color: '#15803d' }}>{analyticsData.resolutionTime?.fastestResolutionHours ?? 2.5} hrs</h4>
                      </div>
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 700 }}>Slowest Resolution</span>
                        <h4 style={{ margin: '0.2rem 0 0 0', color: '#b91c1c' }}>{analyticsData.resolutionTime?.slowestResolutionHours ?? 72.0} hrs</h4>
                      </div>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.85rem', borderRadius: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>Overall Avg Time</span>
                        <h4 style={{ margin: '0.2rem 0 0 0', color: '#1d4ed8' }}>{analyticsData.resolutionTime?.avgResolutionHours ?? 18.4} hrs</h4>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Department Average Speeds</h4>
                      {analyticsData.resolutionTime?.departmentAverages?.map((d) => (
                        <div key={d.department} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0', fontSize: '0.85rem' }}>
                          <span>{d.department}</span>
                          <strong>{d.avgHours} hours</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* PART 8: REPORTS GENERATOR & EXPORT VIEW */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* Part G & I: Search & Global Filters */}
              <FilterPanel
                filters={reportFilters}
                onChange={(key, val) => setReportFilters((prev) => ({ ...prev, [key]: val }))}
                onReset={() => setReportFilters({
                  search: '',
                  department: 'All Departments',
                  status: 'All Statuses',
                  priority: 'All Priorities',
                  worker: 'All Workers',
                  startDate: '',
                  endDate: ''
                })}
                fieldWorkers={fieldWorkers}
              />

              {/* Quick Report Type & Export Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem 1.25rem', borderRadius: '16px', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Preset Report Period:</span>
                  {['daily', 'weekly', 'monthly', 'custom'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReportType(type)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: reportType === type ? '#0f4c81' : '#cbd5e1',
                        background: reportType === type ? '#0f4c81' : '#ffffff',
                        color: reportType === type ? '#ffffff' : '#475569',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {type} Report
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setExportModalOpen(true)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  📥 Export Report (PDF / Excel / CSV)
                </button>
              </div>

              {/* Part H: Filtered Reports Table */}
              <ReportTable
                data={complaints.filter((item) => {
                  const s = reportFilters.search.toLowerCase();
                  const matchesSearch = !s || [item.complaintId, item.title, item.department, item.category, item.citizenName].join(' ').toLowerCase().includes(s);
                  const matchesDept = reportFilters.department === 'All Departments' || normalizeDepartment(item.department) === normalizeDepartment(reportFilters.department);
                  const matchesStatus = reportFilters.status === 'All Statuses' || item.status === reportFilters.status;
                  const matchesPriority = reportFilters.priority === 'All Priorities' || item.priority === reportFilters.priority;
                  const matchesWorker = reportFilters.worker === 'All Workers' || (item.assignedFieldWorker && (item.assignedFieldWorker._id === reportFilters.worker || item.assignedFieldWorker === reportFilters.worker));

                  let matchesDate = true;
                  if (reportFilters.startDate) {
                    matchesDate = matchesDate && new Date(item.createdAt) >= new Date(reportFilters.startDate);
                  }
                  if (reportFilters.endDate) {
                    const e = new Date(reportFilters.endDate);
                    e.setHours(23, 59, 59);
                    matchesDate = matchesDate && new Date(item.createdAt) <= e;
                  }

                  return matchesSearch && matchesDept && matchesStatus && matchesPriority && matchesWorker && matchesDate;
                })}
                onExportClick={() => setExportModalOpen(true)}
              />

              {/* Part M: Report Scheduler Architecture Component */}
              <section className={styles.panel}>
                <h3>Automated Report Scheduler Configuration</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>Configure automated periodic report generation for municipal administrators.</p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axiosInstance.post('/reports/schedule', {
                        frequency: e.target.frequency.value,
                        department: e.target.department.value,
                        email: e.target.email.value
                      });
                      alert('Report schedule saved successfully!');
                    } catch (err) {
                      alert(err.message || 'Scheduling failed.');
                    }
                  }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'end' }}
                >
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    Schedule Frequency
                    <select name="frequency" style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                      <option value="daily">Daily Morning Digest</option>
                      <option value="weekly">Weekly Operational Summary</option>
                      <option value="monthly">Monthly Audit Report</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    Target Department
                    <select name="department" style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    Notification Email
                    <input name="email" type="email" defaultValue="admin@cityconnect.com" style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                  </label>

                  <button type="submit" style={{ background: '#0f4c81', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    Save Schedule
                  </button>
                </form>
              </section>

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

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        filters={reportFilters}
      />
    </div>
  );
}

export default AdminDashboardPage;
