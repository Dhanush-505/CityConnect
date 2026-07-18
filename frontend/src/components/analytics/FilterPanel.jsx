import { MdSearch, MdRefresh, MdFilterList } from 'react-icons/md';

function FilterPanel({
  filters,
  onChange,
  onReset,
  fieldWorkers = []
}) {
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

  return (
    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f4c81', fontWeight: 800 }}>
          <MdFilterList size={20} />
          <span>Global Analytics & Report Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 }}
        >
          <MdRefresh /> Reset Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          Search Keyword
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MdSearch style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onChange('search', e.target.value)}
              placeholder="ID, Title, Area..."
              style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
            />
          </div>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          Department
          <select
            value={filters.department || 'All Departments'}
            onChange={(e) => onChange('department', e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          Status
          <select
            value={filters.status || 'All Statuses'}
            onChange={(e) => onChange('status', e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          Priority
          <select
            value={filters.priority || 'All Priorities'}
            onChange={(e) => onChange('priority', e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          Field Worker
          <select
            value={filters.worker || 'All Workers'}
            onChange={(e) => onChange('worker', e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
          >
            <option value="All Workers">All Workers</option>
            {fieldWorkers.map((w) => <option key={w._id || w.id} value={w._id || w.id}>{w.name}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          From Date
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onChange('startDate', e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
          To Date
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onChange('endDate', e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
          />
        </label>
      </div>
    </div>
  );
}

export default FilterPanel;
