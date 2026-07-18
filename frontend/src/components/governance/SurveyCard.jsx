import React, { useState } from 'react';
import styles from './SurveyCard.module.css';

const SurveyCard = ({ survey, onSubmitResponse }) => {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!survey) return null;

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!onSubmitResponse) return;
    const formattedAnswers = Object.keys(answers).map((qId) => ({
      questionId: qId,
      value: answers[qId],
    }));
    setSubmitting(true);
    await onSubmitResponse(survey._id, formattedAnswers);
    setSubmitting(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>📋 {survey.title}</div>
        <div className={styles.description}>{survey.description}</div>
      </div>

      {survey.hasResponded ? (
        <div className={styles.completedBadge}>✓ Survey Response Submitted (+15 pts)</div>
      ) : (
        <>
          <div className={styles.questionList}>
            {(survey.questions || []).map((q, idx) => (
              <div key={q.id || idx} className={styles.questionItem}>
                <div className={styles.qText}>{idx + 1}. {q.questionText}</div>
                <div className={styles.optionsGrid}>
                  {q.type === 'rating' ? (
                    [1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.optBtn} ${answers[q.id] === star ? styles.optSelected : ''}`}
                        onClick={() => handleSelect(q.id, star)}
                      >
                        ⭐ {star}
                      </button>
                    ))
                  ) : (
                    (q.options || []).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`${styles.optBtn} ${answers[q.id] === opt ? styles.optSelected : ''}`}
                        onClick={() => handleSelect(q.id, opt)}
                      >
                        {opt}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < (survey.questions?.length || 0)}
          >
            {submitting ? 'Submitting...' : 'Submit Survey Response'}
          </button>
        </>
      )}
    </div>
  );
};

export default SurveyCard;
