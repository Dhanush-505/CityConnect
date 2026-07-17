import { useEffect, useState } from 'react';
import styles from '../styles/DashboardComponents.module.css';

function LiveLocationCard() {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('Checking your current location...');

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setMessage('Your live location is ready for faster reporting.');
      },
      () => {
        setMessage('Location access was denied. You can still report issues manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return (
    <div className={styles.locationCard}>
      <h3>Live Location</h3>
      <p>{message}</p>
      {location && (
        <div className={styles.locationMeta}>
          <span>Latitude: {location.lat.toFixed(4)}</span>
          <span>Longitude: {location.lng.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}

export default LiveLocationCard;
