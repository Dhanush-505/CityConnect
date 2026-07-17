import { useState } from 'react';
import { MdStar, MdUploadFile } from 'react-icons/md';
import DashboardLayout from '../layout/DashboardLayout';
import Button from '../../components/common/Button';
import styles from '../styles/FeedbackPage.module.css';

const previousFeedback = [
  { rating: 5, status: 'Resolved', date: '2026-06-20', adminReply: 'Thank you for your feedback. The issue is being tracked.' },
  { rating: 3, status: 'In Review', date: '2026-05-28', adminReply: 'We appreciate your note and are reviewing the experience.' }
];

function FeedbackPage() {
  const [form, setForm] = useState({ rating: 5, category: 'Website', subject: '', suggestions: '', anonymous: false });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <DashboardLayout profile={{ name: 'Aarav' }} notificationsCount={2}>
      <section className={styles.pageShell}>
        <header className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Community Voice</p>
            <h1>Feedback Center</h1>
            <p>Share your experience and help us improve civic services.</p>
          </div>
        </header>

        <div className={styles.summaryGrid}>
          {[
            ['Total Feedback', '42'],
            ['Positive', '34'],
            ['Negative', '4'],
            ['Average Rating', '4.6/5']
          ].map(([label, value]) => (
            <div key={label} className={styles.summaryCard}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.contentGrid}>
          <form className={styles.panel} onSubmit={handleSubmit}>
            <h2>Submit Feedback</h2>
            <label className={styles.field}>
              <span>Rating</span>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" className={value <= form.rating ? styles.activeStar : styles.star} onClick={() => setForm((current) => ({ ...current, rating: value }))}>
                    <MdStar />
                  </button>
                ))}
              </div>
            </label>
            <label className={styles.field}>
              <span>Category</span>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Website</option>
                <option>Complaint Process</option>
                <option>Government Staff</option>
                <option>Officer Behaviour</option>
                <option>Application Performance</option>
                <option>Suggestions</option>
                <option>Others</option>
              </select>
            </label>
            <label className={styles.field}>
              <span>Subject</span>
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="Brief topic" />
            </label>
            <label className={styles.field}>
              <span>Suggestions</span>
              <textarea name="suggestions" rows="4" value={form.suggestions} onChange={handleChange} placeholder="Share your feedback" />
            </label>
            <label className={styles.uploadRow}>
              <MdUploadFile /> Upload screenshot
              <input type="file" accept="image/*" />
            </label>
            <label className={styles.toggleRow}>
              <input type="checkbox" name="anonymous" checked={form.anonymous} onChange={handleChange} />
              <span>Anonymous feedback</span>
            </label>
            <Button variant="primary" type="submit">Submit Feedback</Button>
            {submitted ? <p className={styles.successText}>Thanks! Your feedback has been recorded.</p> : null}
          </form>

          <div className={styles.rightColumn}>
            <section className={styles.panel}>
              <h2>Previous Feedback</h2>
              <div className={styles.feedbackList}>
                {previousFeedback.map((item) => (
                  <article key={item.date} className={styles.feedbackCard}>
                    <div className={styles.feedbackHeader}>
                      <div>
                        <strong>{item.status}</strong>
                        <p>{item.date}</p>
                      </div>
                      <span>{'★'.repeat(item.rating)}</span>
                    </div>
                    <p>{item.adminReply}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default FeedbackPage;
