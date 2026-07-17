import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdEdit, MdExpandMore, MdFilterList, MdSearch, MdThumbUp } from 'react-icons/md';
import DashboardLayout from '../layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import styles from '../styles/MyComplaintsPage.module.css';
import axiosInstance from '../../api/axios';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import LocationCard from '../../components/LocationCard/LocationCard';

const statusOptions = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const steps = ['Submitted', 'Verified', 'Assigned', 'Work Started', 'Resolved'];

function MyComplaintsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const perPage = 10;

  const loadComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const [profileRes, complaintsRes] = await Promise.all([
        axiosInstance.get('/user/profile'),
        axiosInstance.get('/complaints')
      ]);

      setProfile(profileRes?.data || profileRes || null);
      const complaintList = Array.isArray(complaintsRes) ? complaintsRes : complaintsRes?.items || [];
      setComplaints(complaintList);
    } catch (error) {
      setComplaints([]);
      setError('Unable to load your complaints right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();

    const handleRefresh = () => {
      loadComplaints();
    };

    window.addEventListener('cityconnect-complaints-updated', handleRefresh);
    window.addEventListener('storage', (event) => {
      if (event.key === 'cityconnect-complaints-updated') {
        handleRefresh();
      }
    });

    return () => {
      window.removeEventListener('cityconnect-complaints-updated', handleRefresh);
    };
  }, []);

  const sortedComplaints = useMemo(() => {
    const statusPriority = {
      Pending: 0,
      'In Progress': 1,
      Resolved: 2,
      Rejected: 3,
    };

    return [...complaints].sort((left, right) => {
      const leftDate = new Date(left.createdAt || left.date || 0).getTime();
      const rightDate = new Date(right.createdAt || right.date || 0).getTime();
      if (leftDate !== rightDate) return rightDate - leftDate;

      const leftPriority = statusPriority[left.status] ?? 99;
      const rightPriority = statusPriority[right.status] ?? 99;
      return leftPriority - rightPriority;
    });
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return sortedComplaints.filter((complaint) => {
      const matchesSearch = [complaint.title, complaint.category, complaint.department, complaint.status].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter || complaint.normalizedStatus === statusFilter;
      const matchesDepartment = departmentFilter === 'All' || complaint.department === departmentFilter;
      const matchesCategory = categoryFilter === 'All' || complaint.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesDepartment && matchesCategory;
    });
  }, [categoryFilter, departmentFilter, search, sortedComplaints, statusFilter]);

  const pagedComplaints = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredComplaints.slice(start, start + perPage);
  }, [filteredComplaints, page]);

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / perPage));

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, departmentFilter, categoryFilter]);

  const handleDelete = async (complaint) => {
    if (complaint.status !== 'Pending') return;
    setDeletingId(complaint._id || complaint.id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/complaints/${deletingId}`);
      await loadComplaints();
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (error) {
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const handleFeedbackSubmit = async (complaint) => {
    if (!rating) return;
    try {
      await axiosInstance.post(`/complaints/${complaint._id || complaint.id}/feedback`, { rating, comment: feedback });
      await loadComplaints();
      setFeedback('');
      setRating(0);
      setSelectedComplaint(null);
    } catch (error) {
      // no-op to preserve existing experience
    }
  };

  if (loading) {
    return (
      <DashboardLayout profile={profile} notificationsCount={0}>
        <div className={styles.loaderWrap}><Loader fullPage message="Loading your complaints..." /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile} notificationsCount={0}>
      <section className={styles.pageShell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Citizen Services</p>
            <h1>My Complaints</h1>
            <p>Track and manage all complaints you have submitted.</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statChip}>{filteredComplaints.length} Total</div>
            <button className={styles.primaryAction} type="button" onClick={() => navigate('/citizen/raise-complaint')}>Raise Complaint</button>
          </div>
        </header>

        {error ? (
          <div className={styles.emptyState}>
            <h3>We could not load your complaints.</h3>
            <p>{error}</p>
            <button className={styles.primaryAction} type="button" onClick={() => loadComplaints()}>Retry</button>
          </div>
        ) : (
          <>
            <section className={styles.toolbar} aria-label="Complaint filters">
              <label className={styles.searchField}>
                <MdSearch />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints" aria-label="Search complaints" />
              </label>
              <select className={styles.filterSelect} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select className={styles.filterSelect} value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                <option value="All">All departments</option>
                <option value="Public Works">Public Works</option>
                <option value="Electrical">Electrical</option>
                <option value="Drainage">Drainage</option>
              </select>
              <select className={styles.filterSelect} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="All">All categories</option>
                <option value="Roads">Roads</option>
                <option value="Street Lights">Street Lights</option>
                <option value="Drainage">Drainage</option>
              </select>
            </section>

            {!error && (filteredComplaints.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIllustration}>🗂️</div>
                <h3>You haven’t submitted any complaints yet.</h3>
                <p>Start by reporting a civic issue and keep track of it here.</p>
                <button className={styles.primaryAction} type="button" onClick={() => navigate('/citizen/raise-complaint')}>Raise Complaint</button>
              </div>
            ) : (
              <div className={styles.contentGrid}>
                <div className={styles.listPanel}>
                  {pagedComplaints.map((complaint) => (
                    <article className={styles.complaintCard} key={complaint._id || complaint.id}>
                      <div className={styles.cardHeader}>
                        <div>
                          <p className={styles.cardId}>#{complaint._id || complaint.id}</p>
                          <h3>{complaint.title}</h3>
                          <p className={styles.cardMeta}>{complaint.department} • {complaint.category}</p>
                        </div>
                        <StatusBadge status={complaint.status || 'Submitted'} />
                      </div>
                      <p className={styles.description}>{complaint.description}</p>
                      <div className={styles.imageRow}>
                        {complaint.images?.[0] ? <img src={complaint.images[0]} alt={complaint.title} loading="lazy" /> : <div className={styles.imageFallback}>No image</div>}
                      </div>
                      <div className={styles.cardFooter}>
                        <span>{new Date(complaint.createdAt || complaint.date).toLocaleDateString()}</span>
                        <span>{complaint.priority || 'Medium'}</span>
                      </div>
                      <div className={styles.cardActions}>
                        <button type="button" className={styles.textButton} onClick={() => setSelectedComplaint(complaint)}>View Details</button>
                        <button type="button" className={styles.textButton} onClick={() => handleDelete(complaint)} disabled={complaint.status !== 'Pending'}>Delete</button>
                        <button type="button" className={styles.textButton} onClick={() => setSelectedComplaint(complaint)}>Edit</button>
                      </div>
                    </article>
                  ))}
                  <div className={styles.pagination}>
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
                  </div>
                </div>

                <aside className={styles.detailPanel}>
                  {selectedComplaint ? (
                    <>
                      <div className={styles.detailHeader}>
                        <p className={styles.eyebrow}>Complaint Details</p>
                        <h3>{selectedComplaint.title}</h3>
                      </div>
                      <div className={styles.detailSection}>
                        <p><strong>Description</strong><br />{selectedComplaint.description}</p>
                        <p><strong>Department</strong><br />{selectedComplaint.department}</p>
                        <p><strong>Category</strong><br />{selectedComplaint.category}</p>
                        <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                          <LocationCard
                            complaint={selectedComplaint}
                            allowEdit={['Submitted', 'Under Review'].includes(selectedComplaint.status)}
                            onLocationUpdate={loadComplaints}
                          />
                        </div>
                        <p><strong>Officer Remarks</strong><br />{selectedComplaint.remarks || 'No remarks available yet.'}</p>
                      </div>
                      <div className={styles.timelineWrap}>
                        <h4>Status Timeline</h4>
                        <div className={styles.timelineList}>
                          {steps.map((step, index) => {
                            const completed = index <= steps.indexOf(selectedComplaint.status === 'Resolved' ? 'Resolved' : selectedComplaint.status === 'In Progress' ? 'Work Started' : selectedComplaint.status === 'Pending' ? 'Submitted' : 'Verified');
                            return <div key={step} className={`${styles.timelineItem} ${completed ? styles.timelineComplete : ''}`}><span />{step}</div>;
                          })}
                        </div>
                      </div>
                      {selectedComplaint.status === 'Resolved' && (
                        <div className={styles.feedbackBox}>
                          <h4>Feedback</h4>
                          <div className={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={styles.starButton} onClick={() => setRating(value)}>{value <= rating ? '★' : '☆'}</button>)}
                          </div>
                          <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Share your experience" />
                          <button type="button" className={styles.primaryAction} onClick={() => handleFeedbackSubmit(selectedComplaint)}>Submit Feedback</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.placeholder}>Select a complaint to view details.</div>
                  )}
                </aside>
              </div>
            ))}
          </>
        )}

      </section>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h3>Delete complaint?</h3>
            <p>This action cannot be undone unless the complaint is re-submitted.</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.textButton} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button type="button" className={styles.primaryAction} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyComplaintsPage;
