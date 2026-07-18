import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function GeographicAnalytics({ complaints = [] }) {
  // Filter valid coordinates
  const validLocations = useMemo(() => {
    return complaints.filter((c) => {
      const lat = c.location?.latitude ?? c.latitude;
      const lng = c.location?.longitude ?? c.longitude;
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng);
    }).map((c) => ({
      ...c,
      lat: c.location?.latitude ?? c.latitude,
      lng: c.location?.longitude ?? c.longitude
    }));
  }, [complaints]);

  // Center on average or default Bengaluru coordinates
  const center = useMemo(() => {
    if (validLocations.length === 0) return [12.9716, 77.5946];
    const avgLat = validLocations.reduce((acc, curr) => acc + curr.lat, 0) / validLocations.length;
    const avgLng = validLocations.reduce((acc, curr) => acc + curr.lng, 0) / validLocations.length;
    return [avgLat, avgLng];
  }, [validLocations]);

  return (
    <div style={{ height: '380px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validLocations.map((loc) => (
          <Marker key={loc._id || loc.id || loc.complaintId} position={[loc.lat, loc.lng]}>
            <Popup>
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#2563eb' }}>#{loc.complaintId || loc._id}</strong>
                <p style={{ margin: '0.2rem 0', fontWeight: 700 }}>{loc.title}</p>
                <p style={{ margin: 0, color: '#475569' }}>Dept: {loc.department}</p>
                <p style={{ margin: 0, color: '#475569' }}>Status: {loc.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {/* Heatmap intensity circles */}
        {validLocations.map((loc, idx) => (
          <CircleMarker
            key={`circle-${idx}`}
            center={[loc.lat, loc.lng]}
            radius={loc.priority === 'Critical' || loc.priority === 'High' ? 18 : 12}
            pathOptions={{
              color: loc.priority === 'Critical' ? '#dc2626' : loc.priority === 'High' ? '#f97316' : '#3b82f6',
              fillColor: loc.priority === 'Critical' ? '#ef4444' : loc.priority === 'High' ? '#fb923c' : '#60a5fa',
              fillOpacity: 0.35,
              weight: 1
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default GeographicAnalytics;
