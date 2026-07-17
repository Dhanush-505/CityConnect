import { useMemo, useState } from 'react';
import styles from '../styles/RaiseComplaint.module.css';

function ImageUploader({ images = [], onImagesChange, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isAllowedType = /image\/(jpeg|jpg|png)/.test(file.type);
      const isWithinSize = file.size <= 5 * 1024 * 1024;
      return isImage && isAllowedType && isWithinSize;
    });

    const nextImages = [...images, ...validFiles.map((file) => ({ file, preview: URL.createObjectURL(file) }))];
    const limitedImages = nextImages.slice(0, 5);
    onImagesChange(limitedImages);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer?.files || []);
    if (droppedFiles.length === 0) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/jpg';
    Object.defineProperty(input, 'files', { value: droppedFiles });
    handleFiles({ target: input, preventDefault() {} });
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, imageIndex) => imageIndex !== index);
    onImagesChange(updatedImages);
  };

  const uploadHint = useMemo(() => (images.length >= 5 ? 'Maximum 5 images reached.' : 'Up to 5 images, each up to 5 MB, in JPG/PNG format.'), [images.length]);

  return (
    <div className={styles.formField}>
      <label className={styles.label}>Upload Issue Images</label>
      <div
        className={`${styles.uploadDropzone} ${isDragging ? styles.uploadDropzoneActive : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/png,image/jpeg,image/jpg" multiple onChange={handleFiles} />
        <p className={styles.uploadPrompt}>Drag and drop images here or tap to browse</p>
      </div>
      <p className={styles.helpText}>{uploadHint}</p>
      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className={styles.previewCard}>
              <img src={item.preview} alt={`Preview ${index + 1}`} />
              <button type="button" className={styles.removeButton} onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default ImageUploader;
