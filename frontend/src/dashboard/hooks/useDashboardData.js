import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAnnouncements,
  getComplaintStats,
  getComplaints,
  getDashboardSummary,
  getNotifications,
  getUserProfile,
} from '../services/dashboardService';

const initialDashboardData = {
  profile: null,
  stats: null,
  complaints: {
    items: [],
    totalPages: 1,
    totalItems: 0,
  },
  notifications: [],
  announcements: [],
  summary: null,
};

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleComplaintRefresh = () => {
      setRefreshToken((current) => current + 1);
    };

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      const requests = await Promise.allSettled([
        getUserProfile(),
        getComplaints(page, 6),
        getComplaintStats(),
        getNotifications(),
        getAnnouncements(),
        getDashboardSummary(),
      ]);

      if (!isMounted) return;

      const [profileResult, complaintsResult, statsResult, notificationsResult, announcementsResult, summaryResult] = requests;

      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const complaints = complaintsResult.status === 'fulfilled' ? complaintsResult.value : {
        items: [],
        totalPages: 1,
        totalItems: 0,
      };
      const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
      const notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value : [];
      const announcements = announcementsResult.status === 'fulfilled' ? announcementsResult.value : [];
      const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;

      if (profileResult.status === 'rejected' && complaintsResult.status === 'rejected' && statsResult.status === 'rejected') {
        setError({ message: 'Unable to load dashboard data. Please try again later.' });
      }

      setDashboardData({
        profile,
        stats,
        complaints,
        notifications,
        announcements,
        summary,
      });
      setLoading(false);
    };

    fetchDashboard();

    window.addEventListener('cityconnect-complaints-updated', handleComplaintRefresh);
    window.addEventListener('storage', (event) => {
      if (event.key === 'cityconnect-complaints-updated') {
        handleComplaintRefresh();
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('cityconnect-complaints-updated', handleComplaintRefresh);
    };
  }, [page, refreshToken]);

  const complaintSummary = useMemo(() => {
    const items = dashboardData.complaints?.items || [];
    const totalPages = dashboardData.complaints?.totalPages || 1;
    const totalItems = dashboardData.complaints?.totalItems || items.length;
    return { items, totalPages, totalItems };
  }, [dashboardData.complaints]);

  return {
    profile: dashboardData.profile,
    stats: dashboardData.stats,
    complaints: complaintSummary,
    notifications: dashboardData.notifications,
    announcements: dashboardData.announcements,
    summary: dashboardData.summary,
    loading,
    error,
    page,
    setPage,
    refresh,
  };
}
