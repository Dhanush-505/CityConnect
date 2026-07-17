import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../api/axios';
import FieldWorkerLayout from '../components/FieldWorkerLayout';
import styles from '../styles/FieldWorkerTrackerPage.module.css';

// Reusable components
import Timeline from '../../components/Timeline/Timeline';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import TrackingCard from '../../components/TrackingCard/TrackingCard';
import LocationCard from '../../components/LocationCard/LocationCard';

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

function FieldWorkerTrackerPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async (silent = false) => {
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
    } catch (err) {
      setError(err?.message || 'Failed to load tracker tasks.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
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

  return (
    <FieldWorkerLayout>
      <section className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Task Tracker</p>
            <h1>Live Task Progress</h1>
            <p>Monitor your active task progress, milestone states, and verification status.</p>
          </div>
          {selected && (
            <div className={styles.summary} style={{ background: '#0f4c81', color: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
              Complaint #{selected.complaintId}
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading tracker…</p>
        ) : error ? (
          <p style={{ color: '#ef4444' }}>{error}</p>
        ) : tasks.length === 0 ? (
          <p>No active tasks assigned to track progress.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start', marginTop: '1.5rem' }}>
            
            {/* Task selection list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Select Task</span>
              {tasks.map((task) => (
                <div
                  key={task._id || task.complaintId}
                  onClick={() => setSelectedTask(task)}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: selected && (selected._id || selected.id) === (task._id || task.id) ? '#eff6ff' : '#ffffff',
                    borderColor: selected && (selected._id || selected.id) === (task._id || task.id) ? '#2563eb' : '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>#{task.complaintId}</span>
                    <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '0.9rem', color: '#0f172a' }}>{task.title}</h4>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>

            {/* Selected task tracker view */}
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TrackingCard complaint={selected} />

                <LocationCard complaint={selected} />

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1rem' }}>
                  <ProgressBar progress={calculateProgress(selected.status)} />
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.25rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Live Timeline</h3>
                  <Timeline currentStatus={selected.status} timelineEntries={timelineEntries} />
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Select a task to view the tracker timeline.
              </div>
            )}

          </div>
        )}
      </section>
    </FieldWorkerLayout>
  );
}

export default FieldWorkerTrackerPage;
