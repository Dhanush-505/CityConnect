import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdAssignment, MdPendingActions, MdCheckCircle } from 'react-icons/md';
import axiosInstance from '../../api/axios';
import FieldWorkerLayout from '../components/FieldWorkerLayout';
import styles from '../styles/FieldWorkerDashboardPage.module.css';

function FieldWorkerDashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('cityconnect-user') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await axiosInstance.get('/worker/tasks');
        const items = Array.isArray(response?.data) ? response.data : [];
        setTasks(items);
      } catch (loadError) {
        setError(loadError?.message || 'Unable to load tasks right now.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const metricCards = useMemo(() => {
    const assignedTasks = tasks.length;
    const pendingTasks = tasks.filter((task) => ['Submitted', 'Assigned', 'Accepted', 'Under Review', 'Waiting Verification'].includes(task.status)).length;
    const inProgressTasks = tasks.filter((task) => ['Accepted', 'In Progress', 'Waiting Verification'].includes(task.status)).length;
    const completedCount = tasks.filter((task) => ['Completed', 'Resolved', 'Closed'].includes(task.status)).length;
    const completionRate = assignedTasks > 0 ? Math.round((completedCount / assignedTasks) * 100) : 100;
    const overdueTasks = tasks.filter((task) => task.expectedCompletionDate && new Date(task.expectedCompletionDate) < new Date() && !['Completed', 'Resolved', 'Closed'].includes(task.status)).length;

    return [
      { title: 'Assigned Tasks', value: String(assignedTasks), icon: <MdAssignment /> },
      { title: 'Pending Tasks', value: String(pendingTasks), icon: <MdPendingActions /> },
      { title: 'In Progress', value: String(inProgressTasks), icon: <MdLocationOn /> },
      { title: 'Completion Rate', value: `${completionRate}%`, icon: <MdCheckCircle /> },
      { title: 'Overdue Tasks', value: String(overdueTasks), icon: <MdPendingActions /> },
      { title: 'Avg Speed', value: '14.5 hrs', icon: <MdAssignment /> }
    ];
  }, [tasks]);

  const todaySchedule = useMemo(() => {
    return tasks.slice(0, 3).map((task) => ({
      time: task.createdAt ? new Date(task.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Today',
      area: task.complaintLocation || task.department || 'Assigned area',
      priority: task.priority || 'Medium',
      issue: task.title || 'Service request',
    }));
  }, [tasks]);

  return (
    <FieldWorkerLayout>
      <section className={styles.page}>
        <div className={styles.heroCard}>
          <div>
            <p className={styles.eyebrow}>Field Worker Dashboard</p>
            <h1>{`Good Morning, ${storedUser?.name || 'Field Worker'}`}</h1>
            <p className={styles.subtitle}>{`Field Officer • ${storedUser?.department || 'Municipal Services'}`}</p>
          </div>
          <div className={styles.heroBadge}>{`Employee ID: ${storedUser?.employeeId || 'FW-001'}`}</div>
        </div>

        <div className={styles.metricGrid}>
          {metricCards.map((card) => (
            <div key={card.title} className={styles.metricCard}>
              <div className={styles.metricIcon}>{card.icon}</div>
              <div>
                <p className={styles.metricValue}>{card.value}</p>
                <p className={styles.metricTitle}>{card.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.sectionGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Today's Schedule</h2>
              <span>{todaySchedule.length} task{todaySchedule.length === 1 ? '' : 's'}</span>
            </div>
            <div className={styles.scheduleList}>
              {loading ? (
                <p>Loading tasks…</p>
              ) : error ? (
                <p>{error}</p>
              ) : todaySchedule.length === 0 ? (
                <p>No assigned tasks yet.</p>
              ) : todaySchedule.map((task) => (
                <div key={`${task.time}-${task.issue}`} className={styles.scheduleItem}>
                  <div>
                    <p className={styles.scheduleTime}>{task.time}</p>
                    <p className={styles.scheduleIssue}>{task.issue}</p>
                  </div>
                  <div className={styles.scheduleMeta}>
                    <span>{task.area}</span>
                    <span className={styles[task.priority.toLowerCase()]}> {task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Recent Activity</h2>
              <Link to="/field-worker/tasks">View all</Link>
            </div>
            <ul className={styles.timeline}>
              {tasks.length === 0 ? <li>No recent activity yet.</li> : tasks.slice(0, 4).map((task) => <li key={task._id || task.complaintId}>{`${task.title || 'Service request'} • ${task.status}`}</li>)}
            </ul>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Quick Actions</h2>
            <span>Mobile-friendly workflow</span>
          </div>
          <div className={styles.actions}>
            <Link to="/field-worker/tasks" className={styles.actionButton}>View Tasks</Link>
            <Link to="/field-worker/tracker" className={styles.actionButton}>Task Tracker</Link>
            <Link to="/field-worker/notifications" className={styles.actionButton}>Notifications</Link>
          </div>
        </div>
      </section>
    </FieldWorkerLayout>
  );
}

export default FieldWorkerDashboardPage;
