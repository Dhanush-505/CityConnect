import axiosInstance from './axios';

export const submitComplaint = (formData) => axiosInstance.post('/complaints', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const getComplaintsByCitizen = () => axiosInstance.get('/complaints');
