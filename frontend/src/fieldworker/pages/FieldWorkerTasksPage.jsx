import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../api/axios';
import FieldWorkerLayout from '../components/FieldWorkerLayout';
import styles from '../styles/FieldWorkerTasksPage.module.css';

// Reusable components
import Timeline from '../../components/Timeline/Timeline';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ComplaintHistory from '../../components/ComplaintHistory/ComplaintHistory';
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

const WORKER_FLOW_STATUSES = ['Travelling', 'Work Started', 'In Progress'];

function FieldWorkerTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Form states
  const [remarks, setRemarks] = useState('');
  const [progressStatus, setProgressStatus] = useState('In Progress');
  const [attachedFile, setAttachedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTasks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await axiosInstance.get('/worker/tasks');
      const items = Array.isArray(response?.data) ? response.data : response || [];
      setTasks(items);

      if (items.length > 0) {
        setSelectedTask((prevSelected) => {
          const exists = prevSelected && items.find((item) => (item._id || item.id) === (prevSelected._id || prevSelected.id));
          return exists || items[0];
        });
      }
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load tasks right now.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    // Poll task states every 5s for real-time dashboard sync
    const interval = setInterval(() => {
      loadTasks(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch timeline whenever selected task changes
  useEffect(() => {
    if (selectedTask) {
      const fetchTimeline = async () => {
        try {
          const res = await axiosInstance.get(`/complaints/${selectedTask._id || selectedTask.id}/timeline`);
          setTimelineEntries(res?.data || res || []);
        } catch (err) {
          setTimelineEntries([]);
        }
      };
      fetchTimeline();
    }
  }, [selectedTask]);

  const selected = useMemo(() => {
    if (!selectedTask) return null;
    return tasks.find(
      (t) => (t._id || t.id) === (selectedTask._id || selectedTask.id)
    ) || selectedTask;
  }, [tasks, selectedTask]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = [t.complaintId, t.title, t.complaintLocation, t.description]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const handleAccept = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await axiosInstance.put(`/worker/tasks/${selected._id || selected.id}/accept`);
      await loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to accept task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setActionLoading(true);

    const formData = new FormData();
    formData.append('status', progressStatus);
    formData.append('remarks', remarks);
    if (attachedFile) {
      formData.append('image', attachedFile);
    }

    try {
      await axiosInstance.put(`/worker/tasks/${selected._id || selected.id}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRemarks('');
      setAttachedFile(null);
      await loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to update progress.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setActionLoading(true);

    const formData = new FormData();
    formData.append('remarks', remarks);
    if (attachedFile) {
      formData.append('image', attachedFile);
    }

    try {
      await axiosInstance.put(`/worker/tasks/${selected._id || selected.id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRemarks('');
      setAttachedFile(null);
      await loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to submit completion.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <FieldWorkerLayout>
      <section className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Field Services</p>
            <h1>My Tasks Queue</h1>
            <p>Track your assignments, update field progress, and submit proof of resolution.</p>
          </div>
          <div className={styles.summary}>{tasks.length} Active Task{tasks.length === 1 ? '' : 's'}</div>
        </div>

        {/* Toolbar filters */}
        <section style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, details or area..."
            style={{ flex: 1, minWidth: '240px', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Accepted">Accepted</option>
            <option value="Travelling">Travelling</option>
            <option value="Work Started">Work Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting Verification">Waiting Verification</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </section>

        {loading ? (
          <p>Loading tasks…</p>
        ) : error ? (
          <p style={{ color: '#ef4444' }}>{error}</p>
        ) : tasks.length === 0 ? (
          <p>No assigned tasks yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.25rem', alignItems: 'start' }}>
            
            {/* Left Queue column */}
            <div className={styles.taskList}>
              {filteredTasks.length === 0 ? (
                <p>No tasks match the selected filters.</p>
              ) : (
                filteredTasks.map((task) => (
                  <article
                    key={task._id || task.complaintId}
                    onClick={() => setSelectedTask(task)}
                    className={`${styles.taskCard} ${selected && (selected._id || selected.id) === (task._id || task.id) ? styles.activeCard : ''}`}
                    style={{ cursor: 'pointer', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <div className={styles.taskTop} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p className={styles.taskId} style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', margin: 0 }}>#{task.complaintId || 'CMP'}</p>
                        <h3 style={{ margin: '0.2rem 0', color: '#0f172a', fontSize: '1rem' }}>{task.title || 'Service request'}</h3>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Location:</strong> {task.complaintLocation || 'Assigned area'}
                    </p>
                    <div className={styles.taskFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>Citizen: {task.citizenId?.name || task.citizenName || 'Citizen'}</span>
                      <span className={styles[(task.priority || 'Medium').toLowerCase()]} style={{ fontWeight: 700 }}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Right details / action panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selected ? (
                <>
                  {/* Detailed Description */}
                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>#{selected.complaintId}</span>
                      <StatusBadge status={selected.status} />
                    </div>
                    <h2 style={{ margin: '0.25rem 0', fontSize: '1.3rem', color: '#0f172a' }}>{selected.title}</h2>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#475569' }}>{selected.description}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div><strong>Citizen:</strong> {selected.citizenId?.name || selected.citizenName}</div>
                      <div><strong>Phone:</strong> {selected.citizenId?.phone || selected.contactNumber || 'N/A'}</div>
                      <div><strong>Priority:</strong> {selected.priority}</div>
                      <div><strong>Category:</strong> {selected.category}</div>
                      {selected.expectedCompletionDate && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <strong>Completion Target:</strong> {new Date(selected.expectedCompletionDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <LocationCard complaint={selected} />

                  {/* Progress bar */}
                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <ProgressBar progress={calculateProgress(selected.status)} />
                  </div>

                  {/* Workflow Action Engine */}
                  {selected.status === 'Assigned' && (
                    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem', textAlign: 'center' }}>
                      <h3>Task Assigned</h3>
                      <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
                        Please accept this task to notify the administration and citizen that you are taking charge.
                      </p>
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={actionLoading}
                        style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {actionLoading ? 'Accepting...' : 'Accept Assignment'}
                      </button>
                    </div>
                  )}

                  {['Accepted', 'Travelling', 'Work Started', 'In Progress'].includes(selected.status) && (
                    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h3>Update Task Progress</h3>
                      
                      <form onSubmit={handleUpdateProgress} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Select Worker State</span>
                          <select
                            value={progressStatus}
                            onChange={(e) => setProgressStatus(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          >
                            {WORKER_FLOW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Progress Remarks</span>
                          <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Provide update remarks (e.g. travelling to site, material purchased, etc.)..."
                            style={{ minHeight: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          />
                        </label>

                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Attach Image (Optional)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAttachedFile(e.target.files[0])}
                            style={{ fontSize: '0.85rem' }}
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={actionLoading}
                          style={{ padding: '0.65rem', background: '#0f4c81', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {actionLoading ? 'Updating...' : 'Update Progress'}
                        </button>
                      </form>

                      {/* Complete Task action */}
                      <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem' }}>Complete Task</h4>
                        <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Resolution Notes</span>
                            <textarea
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Describe final repair resolution work details..."
                              required
                              style={{ minHeight: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                          </label>

                          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Resolution Image Proof</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setAttachedFile(e.target.files[0])}
                              required
                              style={{ fontSize: '0.85rem' }}
                            />
                          </label>

                          <button
                            type="submit"
                            disabled={actionLoading}
                            style={{ padding: '0.65rem', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            {actionLoading ? 'Submitting...' : 'Submit Resolution for Verification'}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {selected.status === 'Waiting Verification' && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.25rem', textAlign: 'center', color: '#047857' }}>
                      <h3 style={{ margin: '0 0 0.25rem' }}>Resolution Submitted</h3>
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>
                        Waiting for Administrator verification. You will be notified if it is approved or reopened.
                      </p>
                    </div>
                  )}

                  {selected.status === 'Closed' && (
                    <div style={{ background: '#f1f5f9', borderRadius: '20px', border: '1px solid #cbd5e1', padding: '1.25rem', textAlign: 'center', color: '#475569' }}>
                      <h3 style={{ margin: '0 0 0.25rem' }}>Task Closed & Verified</h3>
                      <p style={{ margin: 0, fontSize: '0.88rem' }}>
                        The administrator has successfully verified and closed this task.
                      </p>
                    </div>
                  )}

                  {/* Timeline Tracker */}
                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <h3>Timeline Progress</h3>
                    <Timeline currentStatus={selected.status} timelineEntries={timelineEntries} />
                  </div>

                  <RemarksCard complaint={selected} />

                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <ImageGallery complaint={selected} />
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                    <ComplaintHistory timelineEntries={timelineEntries} />
                  </div>
                </>
              ) : (
                <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Select an active task from the list queue to manage.
                </div>
              )}
            </div>

          </div>
        )}
      </section>
    </FieldWorkerLayout>
  );
}

export default FieldWorkerTasksPage;
