import { useMemo, useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Alert from '../components/common/Alert';
import LocationPicker from './LocationPicker';
import ImageUploader from './ImageUploader';
import styles from '../styles/RaiseComplaint.module.css';

const categoryOptions = [
  'Roads',
  'Drainage',
  'Water Supply',
  'Electricity',
  'Garbage Collection',
  'Street Lights',
  'Public Sanitation',
  'Traffic Signals',
  'Others',
];

const priorityOptions = ['Low', 'Medium', 'High'];

const categorySuggestions = {
  road: 'Roads',
  pothole: 'Roads',
  street: 'Roads',
  light: 'Street Lights',
  electricity: 'Electricity',
  power: 'Electricity',
  water: 'Water Supply',
  leakage: 'Water Supply',
  drainage: 'Drainage',
  drain: 'Drainage',
  garbage: 'Garbage Collection',
  waste: 'Garbage Collection',
  sanitation: 'Public Sanitation',
  traffic: 'Traffic Signals',
};

function ComplaintForm({
  formData,
  errors,
  alert,
  onAlertClose,
  onFieldChange,
  onLocationSelect,
  onUseCurrentLocation,
  onImagesChange,
  onSubmit,
  onCancel,
  loading,
  latitude,
  longitude,
  geoError,
  images,
}) {
  const [suggestion, setSuggestion] = useState('');
  const helperText = useMemo(() => ({
    citizenName: 'Auto-filled from your profile if available.',
    description: 'Describe the issue clearly so the team can respond faster.',
  }), []);

  const descriptionLength = String(formData.description || '').length;
  const suggestedCategory = useMemo(() => {
    const text = String(formData.description || '').toLowerCase();
    if (!text) return '';
    const match = Object.entries(categorySuggestions).find(([keyword]) => text.includes(keyword));
    return match ? match[1] : '';
  }, [formData.description]);

  const handleDescriptionChange = (event) => {
    const value = event.target.value;
    onFieldChange('description')(event);
    const normalized = value.toLowerCase();
    const match = Object.entries(categorySuggestions).find(([keyword]) => normalized.includes(keyword));
    setSuggestion(match ? match[1] : '');
  };

  return (
    <Card className={styles.formCard} title="Complaint Details">
      {alert && <Alert type={alert.type} message={alert.message} onClose={onAlertClose} autoClose={false} />}
      <form onSubmit={onSubmit} noValidate>
        <div className={styles.gridTwo}>
          <div className={styles.formField}>
            <Input
              label="Citizen Name"
              name="citizenName"
              placeholder="Enter your full name"
              value={formData.citizenName}
              onChange={onFieldChange('citizenName')}
              required
              error={errors.citizenName}
            />
            <span className={styles.helpText}>{helperText.citizenName}</span>
          </div>
          <div className={styles.formField}>
            <Input
              label="Complaint Title"
              name="title"
              placeholder="Water Leakage"
              value={formData.title}
              onChange={onFieldChange('title')}
              required
              error={errors.title}
            />
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <label className={styles.label} htmlFor="description">Complaint Description</label>
            <textarea
              id="description"
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              name="description"
              placeholder="Describe the issue in detail"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
            />
            <div className={styles.metaRow}>
              <span className={styles.helpText}>{helperText.description}</span>
              <span className={`${styles.helpText} ${descriptionLength > 1000 ? styles.errorText : ''}`}>{descriptionLength}/1000</span>
            </div>
            {suggestedCategory && !formData.category && (
              <span className={styles.suggestionPill}>Suggested category: {suggestedCategory}</span>
            )}
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="category">Complaint Category</label>
            <select
              id="category"
              className={`${styles.select} ${errors.category ? styles.inputError : ''}`}
              name="category"
              value={formData.category || suggestedCategory}
              onChange={onFieldChange('category')}
              required
            >
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.category && <span className={styles.errorText}>{errors.category}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="priority">Priority</label>
            <select
              id="priority"
              className={`${styles.select} ${errors.priority ? styles.inputError : ''}`}
              name="priority"
              value={formData.priority}
              onChange={onFieldChange('priority')}
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <label className={styles.label}>Complaint Location Marker Selection</label>
            <LocationPicker latitude={latitude} longitude={longitude} onLocationChange={onLocationSelect} error={errors.location} />
          </div>

          <div className={styles.formField}>
            <Input
              label="Landmark"
              name="landmark"
              placeholder="Near Government Hospital"
              value={formData.landmark}
              onChange={onFieldChange('landmark')}
              error={errors.landmark}
            />
          </div>
          <div className={styles.formField}>
            <Input
              label="Contact Number"
              name="contactNumber"
              placeholder="Enter your mobile number"
              value={formData.contactNumber}
              onChange={onFieldChange('contactNumber')}
              required
              error={errors.contactNumber}
            />
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <ImageUploader images={images} onImagesChange={onImagesChange} error={errors.images} />
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ComplaintForm;
