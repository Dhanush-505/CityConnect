import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationPicker.module.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper component to center and update the Leaflet viewport
function MapRefresher({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

// Listener for clicks on the map
function ClickHandler({ onClick }) {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function LocationPicker({ latitude, longitude, onLocationChange, error }) {
  const defaultPosition = [17.3850, 78.4867]; // Default to Hyderabad, India
  const position = latitude && longitude ? [latitude, longitude] : defaultPosition;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [addressName, setAddressName] = useState('');

  // Fetch address metadata whenever coordinates change
  const triggerGeocoding = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CityConnect/1.0'
          }
        }
      );
      const data = await response.json();
      if (data) {
        const addressObj = data.address || {};
        const formattedAddress = data.display_name || '';

        setAddressName(formattedAddress);

        onLocationChange({
          latitude: lat,
          longitude: lng,
          address: formattedAddress,
          city: addressObj.city || addressObj.town || addressObj.village || '',
          state: addressObj.state || '',
          country: addressObj.country || '',
          pincode: addressObj.postcode || ''
        });
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  // Ask for and auto-detect current location on mount
  useEffect(() => {
    if (!latitude || !longitude) {
      handleAutoLocate();
    } else {
      triggerGeocoding(latitude, longitude);
    }
  }, []);

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation services are not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGeoError('');
        await triggerGeocoding(lat, lng);
      },
      (err) => {
        setGeoError('Location permission denied. Drag the marker or use Search box.');
        // Fallback to default
        triggerGeocoding(defaultPosition[0], defaultPosition[1]);
      }
    );
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CityConnect/1.0'
          }
        }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectSearchResult = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchResults([]);
    setSearchQuery('');
    await triggerGeocoding(lat, lng);
  };

  return (
    <div className={styles.container}>
      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className={styles.searchBar}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search area, landmark or street address..."
        />
        <button type="submit" disabled={searchLoading}>
          {searchLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Floating search results dropdown */}
      {searchResults.length > 0 && (
        <ul className={styles.searchResults}>
          {searchResults.map((res) => (
            <li key={res.place_id} onClick={() => selectSearchResult(res)}>
              {res.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Locate Me triggers */}
      <div className={styles.actionRow}>
        <button type="button" className={styles.locateBtn} onClick={handleAutoLocate}>
          🎯 Use Current Location
        </button>
        {geoError && <span className={styles.errorText}>{geoError}</span>}
      </div>

      {/* Map display */}
      <div className={styles.mapCard}>
        <MapContainer center={position} zoom={15} style={{ height: '320px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={triggerGeocoding} />
          {latitude && longitude && (
            <Marker
              position={position}
              icon={markerIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  triggerGeocoding(pos.lat, pos.lng);
                }
              }}
            />
          )}
          <MapRefresher position={position} />
        </MapContainer>
      </div>

      {/* Coordinates / Address Display Card */}
      <div className={styles.addressDisplay}>
        <strong>Mapped Address:</strong>
        <p>{addressName || 'Click or drag the marker to pinpoint the exact location.'}</p>
        <span className={styles.coords}>
          GPS: {latitude ? latitude.toFixed(6) : '—'}, {longitude ? longitude.toFixed(6) : '—'}
        </span>
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default LocationPicker;
