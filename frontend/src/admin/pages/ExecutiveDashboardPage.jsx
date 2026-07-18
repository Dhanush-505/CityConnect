import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExecutiveWidget from '../../components/governance/ExecutiveWidget.jsx';
import PerformanceIndex from '../../components/governance/PerformanceIndex.jsx';
import DepartmentScoreCard from '../../components/governance/DepartmentScoreCard.jsx';
import SLACard from '../../components/governance/SLACard.jsx';
import Leaderboard from '../../components/governance/Leaderboard.jsx';
import EmergencyBanner from '../../components/governance/EmergencyBanner.jsx';
import styles from './ExecutiveDashboardPage.module.css';

const ExecutiveDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [leaderboards, setLeaderboards] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [execRes, slaRes, lbRes, emgRes] = await Promise.all([
        axios.get('/api/executive/dashboard', getAuthHeader()),
        axios.get('/api/sla', getAuthHeader()),
        axios.get('/api/leaderboards', getAuthHeader()),
        axios.get('/api/emergencies', getAuthHeader()),
      ]);

      if (execRes.data.success) setDashboardData(execRes.data.data);
      if (slaRes.data.success) setSlaData(slaRes.data.data);
      if (lbRes.data.success) setLeaderboards(lbRes.data.data);
      if (emgRes.data.success) setEmergencies(emgRes.data.data);
    } catch (err) {
      console.error('Failed to load Executive Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEscalateNow = async () => {
    try {
      const res = await axios.put('/api/sla/escalate', {}, getAuthHeader());
      alert(res.data.message || 'SLA Escalation engine executed.');
      fetchData();
    } catch (err) {
      alert('Failed to execute SLA escalation.');
    }
  };

  const handleExportReport = () => {
    alert('Generating Executive Governance PDF/CSV Report...');
  };

  if (loading) {
    return <div className={styles.page} style={{ textAlign: 'center', padding: '4rem' }}>Loading Executive Smart Governance Suite...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🏛️ Executive Smart Governance Suite</h1>
          <p className={styles.subtitle}>Executive Decision Support, Department Scorecards & City Performance Index</p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={`${styles.actionBtn} ${styles.secondaryBtn}`} onClick={handleEscalateNow}>
            ⚡ Trigger SLA Escalation
          </button>
          <button type="button" className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={handleExportReport}>
            📥 Export Governance Report
          </button>
        </div>
      </div>

      <EmergencyBanner incidents={emergencies} onReportClick={() => alert('Navigate to emergency reporting center')} />

      {dashboardData?.aiInsights && (
        <div className={styles.aiBox}>
          <div className={styles.aiTitle}>🤖 AI Executive Briefing & Insights</div>
          <ul className={styles.aiList}>
            {dashboardData.aiInsights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.widgetsGrid}>
        <ExecutiveWidget title="Total Grievances" value={dashboardData?.totalComplaints || 0} icon="📂" iconBg="#e0f2fe" />
        <ExecutiveWidget title="Active Complaints" value={dashboardData?.activeComplaints || 0} icon="⏳" iconBg="#fef3c7" />
        <ExecutiveWidget title="Resolved Today" value={dashboardData?.resolvedToday || 0} icon="✅" iconBg="#dcfce7" />
        <ExecutiveWidget title="Active Emergencies" value={dashboardData?.activeEmergencies || 0} icon="🚨" iconBg="#fee2e2" />
      </div>

      <div className={styles.mainGrid}>
        <SLACard
          overallCompliance={slaData?.overallCompliance}
          onTrackCount={slaData?.onTrackCount}
          nearBreachCount={slaData?.nearBreachCount}
          breachedCount={slaData?.breachedCount}
          escalatedCount={slaData?.escalatedCount}
        />
        <PerformanceIndex indexData={dashboardData?.cityPerformanceIndex} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🏆 Leaderboards & Ranking</h2>
        <div className={styles.mainGrid}>
          <Leaderboard title="Department Leaderboard" items={leaderboards?.departmentLeaderboard || []} type="department" />
          <Leaderboard title="Field Worker Leaderboard" items={leaderboards?.workerLeaderboard || []} type="worker" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📊 Departmental Scorecards & Grades</h2>
        <div className={styles.scorecardGrid}>
          {(dashboardData?.departmentScorecards || []).map((scorecard, idx) => (
            <DepartmentScoreCard key={idx} scorecard={scorecard} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardPage;
