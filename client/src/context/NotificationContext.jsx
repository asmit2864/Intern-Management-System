import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications');
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
        }
    }, [user]);

    const refreshNotifications = () => {
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            // Optimistically update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const hasUnread = unreadCount > 0;
    const hasNotifications = notifications.length > 0;

    return (
        <NotificationContext.Provider value={{
            notifications,
            loading,
            refreshNotifications,
            hasUnread,
            unreadCount,
            hasNotifications,
            markAllAsRead,
            setNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
