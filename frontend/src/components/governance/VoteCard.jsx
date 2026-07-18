import React, { useState } from 'react';
import styles from './VoteCard.module.css';

const VoteCard = ({ complaint, onVote }) => {
  const [votes, setVotes] = useState(complaint?.votesCount || 0);
  const [voted, setVoted] = useState(complaint?.hasVoted || false);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!onVote || loading) return;
    setLoading(true);
    const res = await onVote(complaint._id || complaint.id);
    if (res) {
      setVotes(res.votesCount);
      setVoted(res.hasVoted);
    }
    setLoading(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.details}>
        <div className={styles.title}>{complaint?.title}</div>
        <div className={styles.meta}>
          <span>🏷️ {complaint?.category || 'General'}</span>
          <span>📍 {complaint?.location || complaint?.complaintLocation || 'City'}</span>
          <span>⚡ Priority: {complaint?.priority || 'Medium'}</span>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.voteBtn} ${voted ? styles.voted : ''}`}
        onClick={handleVote}
        disabled={loading}
      >
        <span>👍</span>
        <span>{voted ? 'Supported' : 'Support this Complaint'}</span>
        <span>({votes})</span>
      </button>
    </div>
  );
};

export default VoteCard;
