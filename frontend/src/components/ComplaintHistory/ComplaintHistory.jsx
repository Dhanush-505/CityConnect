import React, { useState, useMemo } from 'react';
import styles from './ComplaintHistory.module.css';

function ComplaintHistory({ timelineEntries = [] }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Sort timeline entries in reverse chronological order (newest first)
  const sortedEntries = useMemo(() => {
    return [...timelineEntries].sort((a, b) => {
      return new Date(b.timestamp || b.updatedAt) - new Date(a.timestamp || a.updatedAt);
    });
  }, [timelineEntries]);

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / itemsPerPage));

  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedEntries.slice(start, start + itemsPerPage);
  }, [sortedEntries, page]);

  return (
    <div className={styles.historyContainer}>
      <h3 className={styles.title}>Activity History</h3>
      {sortedEntries.length === 0 ? (
        <p className={styles.emptyState}>No activity logged yet.</p>
      ) : (
        <>
          <div className={styles.historyList}>
            {paginatedEntries.map((entry, index) => (
              <div key={index} className={styles.historyItem}>
                <div className={styles.metaRow}>
                  <span className={styles.statusLabel}>{entry.status}</span>
                  <span className={styles.timeLabel}>
                    {new Date(entry.timestamp || entry.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.updaterLabel}>
                    Updated by {entry.updatedBy || 'System'} ({entry.role || 'system'})
                  </span>
                  {entry.remarks && <p className={styles.remarksText}>&ldquo;{entry.remarks}&rdquo;</p>}
                  {entry.image && (
                    <div className={styles.imageAttachment}>
                      <img src={entry.image} alt="Progress attachment" loading="lazy" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ComplaintHistory;
