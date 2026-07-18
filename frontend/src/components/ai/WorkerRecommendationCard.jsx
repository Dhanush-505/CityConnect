import { useState, useEffect } from 'react';
import { MdPsychology, MdCheckCircle, MdPerson, MdNearMe } from 'react-icons/md';
import axiosInstance from '../../api/axios';

function WorkerRecommendationCard({ complaint, onSelectWorker }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!complaint) return;
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.post('/ai/recommend-worker', {
          department: complaint.department,
          latitude: complaint.location?.latitude ?? complaint.latitude,
          longitude: complaint.location?.longitude ?? complaint.longitude
        });
        setRecommendations(res?.data || res);
      } catch (err) {
        setRecommendations(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [complaint]);

  if (!complaint) return null;

  if (loading) {
    return <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '0.5rem 0' }}>AI calculating optimal field officer assignment...</div>;
  }

  const bestWorker = recommendations?.recommendedWorker;
  const candidates = recommendations?.candidates || [];

  if (!bestWorker) return null;

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 800, fontSize: '0.85rem' }}>
          <MdPsychology size={20} color="#16a34a" /> AI Smart Officer Recommendation
        </div>
        <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
          {bestWorker.matchScore} Match Score
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '10px' }}>
        <div>
          <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{bestWorker.name}</strong>
          <span style={{ fontSize: '0.75rem', color: '#475569' }}>
            {bestWorker.department} • Workload: {bestWorker.activeWorkload} active tasks • <MdNearMe style={{ verticalAlign: 'middle' }} /> {bestWorker.distanceKm} km away
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelectWorker && onSelectWorker(bestWorker.id)}
          style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <MdCheckCircle /> Select
        </button>
      </div>

      {candidates.length > 1 && (
        <details style={{ fontSize: '0.75rem', color: '#475569' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>View other AI candidates ({candidates.length - 1})</summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            {candidates.slice(1, 4).map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                <span>{c.name} ({c.department}) - {c.distanceKm}km</span>
                <button
                  type="button"
                  onClick={() => onSelectWorker && onSelectWorker(c.id)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}
                >
                  Use ({c.matchScore})
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default WorkerRecommendationCard;
