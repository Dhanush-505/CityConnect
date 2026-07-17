import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load preferences from localStorage or use defaults
  const getPreferences = () => {
    try {
      const stored = localStorage.getItem('notificationPreferences');
      return stored ? JSON.parse(stored) : {
        complaintUpdates: true,
        announcements: true,
        browserNotifications: true,
        emailNotifications: true,
        taskUpdates: true,
        workerAlerts: true,
        feedbackAlerts: true
      };
    } catch {
      return {
        complaintUpdates: true,
        announcements: true,
        browserNotifications: true,
        emailNotifications: true,
        taskUpdates: true,
        workerAlerts: true,
        feedbackAlerts: true
      };
    }
  };

  const addToast = (title, message, type = 'System') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Read user token and details
    const token = localStorage.getItem('authToken');
    let userId = null;
    let role = null;

    // Parse role from local storage values saved on login
    const adminUser = localStorage.getItem('cityconnect-admin-user');
    const citizenUser = localStorage.getItem('cityconnect-citizen-user');
    const workerUser = localStorage.getItem('cityconnect-worker-user');

    if (adminUser) {
      const parsed = JSON.parse(adminUser);
      userId = parsed.id || parsed._id;
      role = 'admin';
    } else if (citizenUser) {
      const parsed = JSON.parse(citizenUser);
      userId = parsed.id || parsed._id;
      role = 'citizen';
    } else if (workerUser) {
      const parsed = JSON.parse(workerUser);
      userId = parsed.id || parsed._id;
      role = 'field_worker';
    }

    if (!token || !userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const socketHost = baseApiUrl.replace('/api', '');

    const newSocket = io(socketHost, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      newSocket.emit('register', { userId, role });
    });

    newSocket.on('notification', (data) => {
      const prefs = getPreferences();
      
      // Determine if preference allows this type of alert
      let shouldShow = true;
      if (data.type === 'Complaint' && !prefs.complaintUpdates) shouldShow = false;
      if (data.type === 'Announcement' && !prefs.announcements) shouldShow = false;

      if (shouldShow) {
        // Increment unread notifications count locally
        setUnreadCount((c) => c + 1);
        setNotifications((prev) => [data, ...prev]);

        // Push toast notification
        addToast(data.title, data.message, data.type);

        // Native browser alert
        if (prefs.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      }
    });

    newSocket.on('announcement_published', (data) => {
      const prefs = getPreferences();
      if (prefs.announcements) {
        addToast(`Announcement: ${data.title}`, data.description, 'Announcement');

        if (prefs.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`Announcement: ${data.title}`, {
            body: data.description
          });
        }
      }
    });

    setSocket(newSocket);

    // Initial fetch of unread count via normal API helper
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
          setUnreadCount(json.data.filter((n) => !n.isRead).length);
        }
      } catch (err) {
        console.error('Failed to fetch initial notifications:', err);
      }
    };
    fetchNotifications();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await fetch(`${baseApiUrl}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await fetch(`${baseApiUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Re-evaluate count
      setUnreadCount((c) => Math.max(0, notifications.find(n => n._id === id && !n.isRead) ? c - 1 : c));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount, notifications, setNotifications, markAllRead, deleteNotification }}>
      {children}
      
      {/* Toast Alert Portal Overlay */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '350px'
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            animation: 'slideIn 0.3s ease-out forwards',
            borderLeft: `5px solid ${toast.type === 'Announcement' ? '#f59e0b' : toast.type === 'Assignment' ? '#3b82f6' : '#10b981'}`
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{toast.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{toast.message}</div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </SocketContext.Provider>
  );
};
