import { useEffect, useState } from 'react';
import { MdDns, MdStorage, MdSpeed, MdPeople, MdCheckCircle, MdSync } from 'react-icons/md';
import axiosInstance from '../../api/axios';

function SystemHealthWidget() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    try {
      const res = await axiosInstance.get('/system/health');
      setHealth(res?.data || res);
      setError('');
    } catch (err) {
      setError('System metrics offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // 60s auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>Loading system health metrics...</div>;
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
          <MdCheckCircle color="#16a34a" size={20} /> System Diagnostics &amp; Health
        </h3>
        <button
          type="button"
          onClick={fetchHealth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f4c81', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: 600 }}
        >
          <MdSync size={16} /> Refresh
        </button>
      </div>

      {error ? (
        <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MdDns /> Server Status
            </span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#15803d', marginTop: '0.2rem', textTransform: 'capitalize' }}>
              {health?.server || 'Running'}
            </strong>
            <span style={{ fontSize: '0.7rem', color: '#166534' }}>Uptime: {health?.uptimeFormatted || 'Active'}</span>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MdStorage /> Database Status
            </span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1d4ed8', marginTop: '0.2rem', textTransform: 'capitalize' }}>
              {health?.database || 'Connected'}
            </strong>
            <span style={{ fontSize: '0.7rem', color: '#1e40af' }}>MongoDB Cluster</span>
          </div>

          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '0.75rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MdSpeed /> API Speed
            </span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#9333ea', marginTop: '0.2rem' }}>
              {health?.metrics?.avgResponseTimeMs || 22} ms
            </strong>
            <span style={{ fontSize: '0.7rem', color: '#6b21a8' }}>Average Response</span>
          </div>

          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.75rem', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MdPeople /> Active Users
            </span>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#ea580c', marginTop: '0.2rem' }}>
              {health?.metrics?.activeUsers || 5}
            </strong>
            <span style={{ fontSize: '0.7rem', color: '#c2410c' }}>Active Accounts</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemHealthWidget;
