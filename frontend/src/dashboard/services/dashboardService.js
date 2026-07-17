import axiosInstance from '../../api/axios';

export const getUserProfile = () => axiosInstance.get('/user/profile');
export const getComplaints = (page = 1, limit = 6) => axiosInstance.get(`/complaints?page=${page}&limit=${limit}`);
export const getComplaintStats = () => axiosInstance.get('/complaints/stats');
export const getNotifications = () => axiosInstance.get('/notifications');
export const getAnnouncements = () => axiosInstance.get('/announcements');
export const getDashboardSummary = () => axiosInstance.get('/dashboard');
