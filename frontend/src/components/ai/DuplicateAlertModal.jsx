import { MdWarning, MdClose, MdThumbUp } from 'react-icons/md';

function DuplicateAlertModal({ isOpen, onClose, duplicates = [], onProceedAnyway }) {
  if (!isOpen || duplicates.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.75rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: 800 }}>
            <MdWarning size={24} color="#f97316" /> Similar Existing Complaint Detected
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <MdClose size={22} />
          </button>
        </div>

        <p style={{ color: '#475569', fontSize: '0.85rem', margin: '1rem 0' }}>
          AI detected similar complaints reported near this area. You can support an existing complaint to avoid duplicate entries and speed up resolution:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
          {duplicates.map((dup) => (
            <div key={dup.id || dup.complaintId} style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '12px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c' }}>#{dup.complaintId}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>{dup.similarityScore} Similarity</span>
              </div>
              <h4 style={{ margin: '0.2rem 0', color: '#0f172a', fontSize: '0.9rem' }}>{dup.title}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Category: {dup.category} • Status: {dup.status} • {dup.distanceKm} km away
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={onProceedAnyway}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
          >
            Continue submitting new complaint
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{ background: '#0f4c81', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <MdThumbUp /> Support Existing Case
          </button>
        </div>
      </div>
    </div>
  );
}

export default DuplicateAlertModal;
