import React from 'react';
import styles from './Leaderboard.module.css';

const Leaderboard = ({ title = 'Top Performers', items = [], type = 'department' }) => {
  const getRankStyle = (idx) => {
    if (idx === 0) return styles.rank1;
    if (idx === 1) return styles.rank2;
    if (idx === 2) return styles.rank3;
    return styles.rankDefault;
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>🥇 {title}</div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>{type === 'department' ? 'Department' : 'Field Worker'}</th>
            <th>{type === 'department' ? 'Resolution %' : 'Completed'}</th>
            <th>Performance Score</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 5).map((item, idx) => (
            <tr key={idx}>
              <td>
                <span className={`${styles.rankBadge} ${getRankStyle(idx)}`}>
                  {idx + 1}
                </span>
              </td>
              <td>
                <strong>{item.name}</strong>
                {type === 'worker' && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.department}</div>}
              </td>
              <td>{type === 'department' ? `${item.resolutionRate || 0}%` : item.tasksCompleted || 0}</td>
              <td>
                <span className={styles.scorePill}>{item.score || item.qualityScore || 0} pts</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
