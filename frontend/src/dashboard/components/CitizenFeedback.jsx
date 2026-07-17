import { useMemo, useState } from 'react';
import styles from '../styles/DashboardComponents.module.css';

function CitizenFeedback({ complaint }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const helperText = useMemo(() => 'Your feedback helps improve city services.', []);

  if (!complaint) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!rating) return;
    setSubmitted(true);
  };

  return (
    <form className={styles.feedbackPanel} onSubmit={handleSubmit}>
      <div className={styles.feedbackHeader}>
        <h3>Share your experience</h3>
        <p>{helperText}</p>
      </div>
      <div className={styles.starsRow} aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" className={styles.starButton} onClick={() => setRating(value)} aria-label={`Rate ${value} star`}>
            {value <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
      <textarea className={styles.feedbackTextArea} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tell us how the service went..." />
      <button type="submit" className={styles.feedbackSubmit}>Submit Feedback</button>
      {submitted && <p className={styles.feedbackSuccess}>Thank you for your feedback.</p>}
    </form>
  );
}

export default CitizenFeedback;
