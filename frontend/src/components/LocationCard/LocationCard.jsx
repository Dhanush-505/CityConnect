import React, { useState } from 'react';
import styles from './LocationCard.module.css';
import MiniMap from '../MiniMap/MiniMap';
import MapModal from '../MapModal/MapModal';
import LocationPicker from '../LocationPicker/LocationPicker';
import axiosInstance from '../../api/axios';

function LocationCard({ complaint = {}, allowEdit = false, onLocationUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Temporary picker selection state
  const [tempLocation, setTempLocation] = useState(null);

  // Fallback to root coordinates/location for backwards compatibility
  const latitude = complaint.location?.latitude ?? complaint.latitude;
  const longitude = complaint.location?.longitude ?? complaint.longitude;
  const address = complaint.location?.address ?? complaint.complaintLocation;
  const landmark = complaint.location?.landmark ?? complaint.landmark;

  const hasCoordinates = latitude && longitude;

  const handleEditSave = async () => {
    if (!tempLocation) {
      setEditModalOpen(false);
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.put(`/complaints/${complaint._id || complaint.id}/location`, tempLocation);
      if (onLocationUpdate) {
        onLocationUpdate();
      }
      setEditModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>📍 Location Intelligence</h3>

      <div className={styles.body}>
        <div className={styles.details}>
          <div className={styles.item}>
            <span className={styles.label}>Readable Address</span>
            <span className={styles.value}>{address || 'No location address tagged.'}</span>
          </div>

          {landmark && (
            <div className={styles.item}>
              <span className={styles.label}>Landmark</span>
              <span className={styles.value}>{landmark}</span>
            </div>
          )}

          <div className={styles.coordsRow}>
            <div className={styles.coord}>
              <span className={styles.label}>Latitude</span>
              <span className={styles.value}>{latitude ? latitude.toFixed(5) : '—'}</span>
            </div>
            <div className={styles.coord}>
              <span className={styles.label}>Longitude</span>
              <span className={styles.value}>{longitude ? longitude.toFixed(5) : '—'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            {hasCoordinates && (
              <button
                type="button"
                className={styles.mapBtn}
                onClick={() => setModalOpen(true)}
                style={{ flex: 1 }}
              >
                View Map
              </button>
            )}
            {allowEdit && (
              <button
                type="button"
                className={styles.editBtn}
                onClick={() => {
                  setTempLocation({
                    latitude,
                    longitude,
                    address,
                    landmark,
                    city: complaint.location?.city || '',
                    state: complaint.location?.state || '',
                    country: complaint.location?.country || '',
                    pincode: complaint.location?.pincode || ''
                  });
                  setEditModalOpen(true);
                }}
                style={{ flex: 1 }}
              >
                Edit Location
              </button>
            )}
          </div>
        </div>

        <div className={styles.mapContainer}>
          <MiniMap latitude={latitude} longitude={longitude} height="160px" />
        </div>
      </div>

      <MapModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        latitude={latitude}
        longitude={longitude}
        address={address}
        landmark={landmark}
      />

      {/* Edit Location Modal */}
      {editModalOpen && (
        <div className={styles.editOverlay} onClick={() => setEditModalOpen(false)}>
          <div className={styles.editContent} onClick={(e) => e.stopPropagation()}>
            <header className={styles.editHeader}>
              <h3>Edit Location Coordinates</h3>
              <button className={styles.closeBtn} type="button" onClick={() => setEditModalOpen(false)}>&times;</button>
            </header>
            <div className={styles.editBody}>
              <LocationPicker
                latitude={tempLocation?.latitude || latitude}
                longitude={tempLocation?.longitude || longitude}
                onLocationChange={(loc) => setTempLocation(loc)}
              />
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleEditSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationCard;
