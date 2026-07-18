import { useState, useMemo } from 'react';
import { MdChevronLeft, MdChevronRight, MdFileDownload } from 'react-icons/md';
import StatusBadge from '../StatusBadge/StatusBadge';

function ReportTable({ data = [], onExportClick }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(data.length / pageSize) || 1;

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page]);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Generated Report Records</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Showing {data.length} total matching complaint records</span>
        </div>
        <button
          type="button"
          onClick={onExportClick}
          style={{ background: '#0f4c81', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <MdFileDownload size={18} /> Export Data
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Title</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Department</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Priority</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Worker</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No complaint records match the current report filters.
                </td>
              </tr>
            ) : (
              pageItems.map((item) => (
                <tr key={item._id || item.id || item.complaintId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: '#2563eb' }}>#{item.complaintId || item._id}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{item.title}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{item.department}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{item.category}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: item.priority === 'Critical' ? '#dc2626' : item.priority === 'High' ? '#ea580c' : '#475569' }}>{item.priority}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>{item.assignedFieldWorker?.name || 'Unassigned'}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Page {page} of {totalPages}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ padding: '0.35rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
          >
            <MdChevronLeft /> Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: '0.35rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next <MdChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportTable;
