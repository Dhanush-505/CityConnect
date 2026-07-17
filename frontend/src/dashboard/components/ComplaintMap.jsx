import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '../styles/DashboardComponents.module.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ComplaintMap({ complaints = [] }) {
  const points = complaints.filter((item) => item?.location?.lat && item?.location?.lng);
  const center = points[0] ? [points[0].location.lat, points[0].location.lng] : [12.9716, 77.5946];

  if (points.length === 0) {
    return <div className={styles.emptyState}>No location data is available for your complaints yet.</div>;
  }

  return (
    <div className={styles.mapCard}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className={styles.mapContainer}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {points.map((complaint) => (
          <Marker key={complaint.id || complaint._id} position={[complaint.location.lat, complaint.location.lng]} icon={markerIcon}>
            <Popup>
              <div className={styles.mapPopup}>
                <strong>{complaint.title}</strong>
                <p>{complaint.status}</p>
                <span>{new Date(complaint.date || complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default ComplaintMap;
