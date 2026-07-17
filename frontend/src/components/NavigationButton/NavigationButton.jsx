import React from 'react';
import { MdDirections } from 'react-icons/md';

function NavigationButton({ latitude, longitude, label = 'Navigate', className = '' }) {
  const handleNavigate = () => {
    if (!latitude || !longitude) {
      alert('Location coordinates are not available.');
      return;
    }
    // Launch turn-by-turn navigation in a new tab
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleNavigate}
      title="Navigate to destination using Google Maps"
    >
      <MdDirections /> {label}
    </button>
  );
}

export default NavigationButton;
