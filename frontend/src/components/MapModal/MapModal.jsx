import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapModal.module.css';
import NavigationButton from '../NavigationButton/NavigationButton';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapRefresher({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

function MapModal({ isOpen, onClose, latitude, longitude, address, landmark }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultPosition = [17.3850, 78.4867];
  const position = latitude && longitude ? [latitude, longitude] : defaultPosition;

  const handleCopy = () => {
    if (!latitude || !longitude) return;
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>Complaint Location Details</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.mapContainer}>
            <MapContainer
              center={position}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={markerIcon} />
              <MapRefresher position={position} />
            </MapContainer>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.addressBox}>
              <h3>Full Address</h3>
              <p>{address || 'No readable address coordinates logged.'}</p>
              {landmark && (
                <div className={styles.landmark}>
                  <strong>Landmark:</strong> {landmark}
                </div>
              )}
            </div>

            <div className={styles.coordsBox}>
              <div>
                <strong>Latitude:</strong> {latitude || '—'}
              </div>
              <div>
                <strong>Longitude:</strong> {longitude || '—'}
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopy}
                disabled={!latitude || !longitude}
              >
                {copied ? 'Copied Coordinates!' : 'Copy Coordinates'}
              </button>
              <NavigationButton
                latitude={latitude}
                longitude={longitude}
                label="Launch Navigation"
                className={styles.navBtn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapModal;
