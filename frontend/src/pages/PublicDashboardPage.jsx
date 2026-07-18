import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PublicStatistics from '../components/governance/PublicStatistics.jsx';
import GovernanceChart from '../components/governance/GovernanceChart.jsx';
import PerformanceIndex from '../components/governance/PerformanceIndex.jsx';
import styles from './PublicDashboardPage.module.css';

const PublicDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await axios.get('/api/public/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch public dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  if (loading) {
    return <div className={styles.page} style={{ textAlign: 'center', padding: '4rem' }}>Loading Public Governance Data...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>🌐 Smart City Public Transparency Portal</h1>
        <p className={styles.heroSubtitle}>
          Real-time open statistics on civic grievance resolution, departmental efficiency, and city performance.
        </p>
      </div>

      <PublicStatistics stats={data} />

      <div className={styles.section}>
        <div className={styles.gridTwo}>
          <PerformanceIndex indexData={{ score: data?.cityIndexScore, status: data?.cityIndexStatus }} />
          <GovernanceChart title="Department Performance" data={data?.departmentPerformance || []} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📍 Active Public Grievances (Anonymized)</h2>
        <div className={styles.issuesList}>
          {(data?.activePublicIssues || []).map((issue) => (
            <div key={issue.id} className={styles.issueCard}>
              <div>
                <div className={styles.issueTitle}>{issue.title}</div>
                <div className={styles.issueMeta}>
                  <span>ID: {issue.complaintId}</span> • <span>Dept: {issue.department}</span> • <span>Location: {issue.location}</span>
                </div>
              </div>
              <div>
                <span className={styles.statusPill}>{issue.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboardPage;
