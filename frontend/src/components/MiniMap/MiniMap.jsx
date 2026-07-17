import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MiniMap.module.css';

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

function MiniMap({ latitude, longitude, height = '150px' }) {
  const defaultPosition = [17.3850, 78.4867]; // Hyderabad center default
  const position = latitude && longitude ? [latitude, longitude] : defaultPosition;

  if (!latitude || !longitude) {
    return (
      <div className={styles.noCoordinates} style={{ height }}>
        <p>No map coordinates available.</p>
      </div>
    );
  }

  return (
    <div className={styles.miniMapWrapper} style={{ height }}>
      <MapContainer
        center={position}
        zoom={15}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={markerIcon} />
        <MapRefresher position={position} />
      </MapContainer>
    </div>
  );
}

export default MiniMap;
