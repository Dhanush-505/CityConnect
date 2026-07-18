import React from 'react';
import styles from './RecognitionBadge.module.css';

const RecognitionBadge = ({ name = 'Active Citizen' }) => {
  const getBadgeMeta = (badgeName) => {
    switch (badgeName) {
      case 'Active Citizen':
        return { icon: '🌟', style: styles.activeCitizen };
      case 'Community Volunteer':
        return { icon: '🙋‍♂️', style: styles.communityVolunteer };
      case 'City Guardian':
        return { icon: '🛡️', style: styles.cityGuardian };
      case 'Problem Reporter':
        return { icon: '🔍', style: styles.problemReporter };
      case 'Top Contributor':
        return { icon: '👑', style: styles.topContributor };
      default:
        return { icon: '🏅', style: styles.defaultBadge };
    }
  };

  const meta = getBadgeMeta(name);

  return (
    <div className={`${styles.badge} ${meta.style}`}>
      <span>{meta.icon}</span>
      <span>{name}</span>
    </div>
  );
};

export default RecognitionBadge;
