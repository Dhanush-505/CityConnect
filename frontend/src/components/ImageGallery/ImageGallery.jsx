import React, { useState } from 'react';
import styles from './ImageGallery.module.css';

function ImageGallery({ complaint = {} }) {
  const [activeImage, setActiveImage] = useState(null);

  // Before images: initial submission images
  const beforeImages = complaint.complaintImages || complaint.images || [];

  // Work Progress and Final Resolution images: extract from timeline entries
  const timelineEntries = complaint.timeline || [];
  
  // Progress images: field_worker progress update images (exclude complete state)
  const progressEntries = timelineEntries.filter(
    (e) => e.role === 'field_worker' && e.image && e.status !== 'Waiting Verification' && e.status !== 'Completed'
  );

  // Final Resolution images: completion / verify images
  const resolutionEntries = timelineEntries.filter(
    (e) => (e.status === 'Waiting Verification' || e.status === 'Closed') && e.image
  );

  const hasImages = beforeImages.length > 0 || progressEntries.length > 0 || resolutionEntries.length > 0;

  if (!hasImages) {
    return (
      <div className={styles.emptyGallery}>
        <p>No images have been uploaded for this complaint.</p>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      <h3 className={styles.title}>Resolution Gallery</h3>

      <div className={styles.galleryGrid}>
        {/* Before column */}
        {beforeImages.length > 0 && (
          <div className={styles.gallerySection}>
            <span className={styles.sectionHeader}>Before</span>
            <div className={styles.imageGrid}>
              {beforeImages.map((img, idx) => (
                <div key={idx} className={styles.thumbnail} onClick={() => setActiveImage(img)}>
                  <img src={img} alt={`Before ${idx + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress column */}
        {progressEntries.length > 0 && (
          <div className={styles.gallerySection}>
            <span className={styles.sectionHeader}>In Progress</span>
            <div className={styles.imageGrid}>
              {progressEntries.map((entry, idx) => (
                <div key={idx} className={styles.thumbnail} onClick={() => setActiveImage(entry.image)}>
                  <img src={entry.image} alt={`Progress ${idx + 1}`} loading="lazy" />
                  <span className={styles.caption}>{entry.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* After column */}
        {resolutionEntries.length > 0 && (
          <div className={styles.gallerySection}>
            <span className={styles.sectionHeader}>Final Resolution</span>
            <div className={styles.imageGrid}>
              {resolutionEntries.map((entry, idx) => (
                <div key={idx} className={styles.thumbnail} onClick={() => setActiveImage(entry.image)}>
                  <img src={entry.image} alt={`Resolution ${idx + 1}`} loading="lazy" />
                  <span className={styles.caption}>Completed</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal/Lightboxing for zoomed image */}
      {activeImage && (
        <div className={styles.lightbox} onClick={() => setActiveImage(null)}>
          <div className={styles.lightboxContent}>
            <img src={activeImage} alt="Zoomed view" />
            <button className={styles.closeBtn} type="button" onClick={() => setActiveImage(null)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
