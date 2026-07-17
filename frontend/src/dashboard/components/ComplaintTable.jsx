import styles from '../styles/DashboardComponents.module.css';
import StatusBadge from './StatusBadge';
import { Button } from '../../components/common';

function ComplaintTable({ complaints = [], page, totalPages, onPageChange, onViewComplaint }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.complaintTable}>
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Title</th>
              <th>Department</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyRow}>
                  No complaints found.
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint._id || complaint.id}>
                  <td>{complaint._id || complaint.id}</td>
                  <td>{complaint.title}</td>
                  <td>{complaint.department || complaint.category || 'Public Works'}</td>
                  <td><StatusBadge status={complaint.status || 'Pending'} /></td>
                  <td>{complaint.priority || 'Medium'}</td>
                  <td>{new Date(complaint.date || complaint.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="secondary" size="small" onClick={() => onViewComplaint?.(complaint)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.paginationRow}>
        <Button variant="secondary" size="small" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button variant="secondary" size="small" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default ComplaintTable;
