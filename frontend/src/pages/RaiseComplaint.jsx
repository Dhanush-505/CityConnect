import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../dashboard/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import axiosInstance from '../api/axios';
import ComplaintForm from './ComplaintForm';
import styles from '../styles/RaiseComplaint.module.css';

function RaiseComplaintPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [formData, setFormData] = useState({
    citizenName: '',
    title: '',
    description: '',
    category: '',
    landmark: '',
    priority: 'Medium',
    contactNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const user = await axiosInstance.get('/user/profile');
        setProfile(user);
        setFormData((current) => ({ ...current, citizenName: user?.name || '', contactNumber: user?.contactNumber || '' }));
      } catch (error) {
        setProfile({ name: 'Citizen' });
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleFieldChange = (name) => (event) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!String(formData.citizenName || '').trim()) nextErrors.citizenName = 'Citizen name is required.';
    if (!String(formData.title || '').trim()) nextErrors.title = 'Complaint title is required.';
    if (String(formData.title || '').trim().length > 100) nextErrors.title = 'Title must be 100 characters or fewer.';
    if (!String(formData.description || '').trim()) nextErrors.description = 'Complaint description is required.';
    if (String(formData.description || '').trim().length < 30) nextErrors.description = 'Description must be at least 30 characters.';
    if (String(formData.description || '').trim().length > 1000) nextErrors.description = 'Description must be 1000 characters or fewer.';
    if (!formData.category) nextErrors.category = 'Please select a category.';
    if (!latitude || !longitude) nextErrors.location = 'Please select a location on the map.';
    if (!String(formData.contactNumber || '').trim()) nextErrors.contactNumber = 'Contact number is required.';
    if (!/^\d{10}$/.test(String(formData.contactNumber || '').trim())) nextErrors.contactNumber = 'Enter a valid 10-digit mobile number.';
    if (images.length > 5) nextErrors.images = 'You can upload up to 5 images.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setAlert({ type: 'error', message: 'Please correct the highlighted fields.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('citizenName', formData.citizenName);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('latitude', latitude);
      formDataToSend.append('longitude', longitude);
      formDataToSend.append('address', address);
      formDataToSend.append('city', city);
      formDataToSend.append('state', stateName);
      formDataToSend.append('country', country);
      formDataToSend.append('pincode', pincode);
      formDataToSend.append('landmark', formData.landmark);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('status', 'Submitted');
      images.forEach((image) => formDataToSend.append('images', image.file));

      const response = await axiosInstance.post('/complaints', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setAlert({ type: 'success', message: response?.message || 'Complaint submitted successfully.' });
      window.dispatchEvent(new Event('cityconnect-complaints-updated'));
      localStorage.setItem('cityconnect-complaints-updated', String(Date.now()));
      setFormData({
        citizenName: profile?.name || '',
        title: '',
        description: '',
        category: '',
        landmark: '',
        priority: 'Medium',
        contactNumber: profile?.contactNumber || '',
      });
      setLatitude('');
      setLongitude('');
      setAddress('');
      setCity('');
      setStateName('');
      setCountry('');
      setPincode('');
      setImages([]);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      const message = error?.message || 'Unable to submit complaint right now.';
      setAlert({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGeoError('');
        setErrors((current) => ({ ...current, location: '' }));
      },
      () => {
        setGeoError('Location access was denied. You can still pick a location manually on the map.');
      }
    );
  };

  const handleLocationSelect = (locationData) => {
    setLatitude(locationData.latitude);
    setLongitude(locationData.longitude);
    setAddress(locationData.address);
    setCity(locationData.city);
    setStateName(locationData.state);
    setCountry(locationData.country);
    setPincode(locationData.pincode);
    setErrors((current) => ({ ...current, location: '' }));
  };

  const handleImagesChange = (nextImages) => {
    setImages(nextImages);
    setErrors((current) => ({ ...current, images: '' }));
  };

  const pageTitle = useMemo(() => 'Raise a Complaint', []);

  if (loading) {
    return (
      <DashboardLayout profile={profile} notificationsCount={0}>
        <Loader fullPage message="Preparing complaint form..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout profile={profile} notificationsCount={0}>
      <div className={styles.pageShell}>
        <header className={styles.pageHeader}>
          <p className={styles.pageEyebrow}>Citizen Services</p>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageSubtitle}>Help us improve your city by reporting civic issues.</p>
        </header>
        <ComplaintForm
          formData={formData}
          errors={errors}
          alert={alert}
          onAlertClose={() => setAlert(null)}
          onFieldChange={handleFieldChange}
          onLocationSelect={handleLocationSelect}
          onUseCurrentLocation={handleUseCurrentLocation}
          onImagesChange={handleImagesChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
          loading={submitting}
          latitude={latitude}
          longitude={longitude}
          geoError={geoError}
          images={images}
        />
      </div>
    </DashboardLayout>
  );
}

export default RaiseComplaintPage;
