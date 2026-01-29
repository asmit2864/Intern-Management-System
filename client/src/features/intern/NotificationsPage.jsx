import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Bell, Check, Info, AlertTriangle, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotification } from '../../context/NotificationContext';

const NotificationsPage = () => {
    // Use global state
    const { notifications, loading, setNotifications, refreshNotifications, markAllAsRead } = useNotification();

    // No need for local fetch logic, Context handles it on mount/interval.
    // However, if we want to ensure freshness on page visit:
    useEffect(() => {
        refreshNotifications();
        markAllAsRead(); // Mark all as read when page is visited
    }, []);

    const handleDismiss = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            // Update global state immediately for UI responsiveness
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification dismissed');
        } catch (error) {
            console.error('Failed to dismiss', error);
            toast.error('Failed to dismiss notification');
        }
    };

    const handleClearAll = async () => {
        try {
            // MVP: Delete one by one in parallel
            await Promise.all(notifications.map(n => api.delete(`/notifications/${n._id}`)));
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            console.error('Failed to clear all', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <Check className="w-5 h-5 text-emerald-600" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
            case 'alert': return <AlertTriangle className="w-5 h-5 text-rose-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 border-emerald-100 text-emerald-900';
            case 'warning': return 'bg-amber-50 border-amber-100 text-amber-900';
            case 'alert': return 'bg-rose-50 border-rose-100 text-rose-900';
            default: return 'bg-blue-50 border-blue-100 text-blue-900';
        }
    };

    const getHeading = (note) => {
        if (note.title) return note.title;

        switch (note.type) {
            case 'success':
                return note.message.toLowerCase().includes('updated') ? 'Review Resubmitted' : 'Review Submitted';
            case 'warning': return 'Training Removed';
            case 'alert': return 'Important Alert';
            default: return 'New Message';
        }
    };

    if (loading && notifications.length === 0) return <div className="p-8 text-center text-slate-500">Loading notifications...</div>;

    return (
        <div className="w-full space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-600" />
                        Notifications
                    </h1>
                    {/* <p className="text-slate-500">Updates on your training and performance.</p> */}
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </header>

            {notifications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                        <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                    <p className="text-slate-500">You have no new notifications.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((note) => (
                        <div
                            key={note._id}
                            className={`p-6 rounded-xl border flex items-start justify-between transition-all hover:shadow-md ${getStyles(note.type || 'info')}`}
                        >
                            <div className="flex gap-4 flex-1 min-w-0">
                                <div className={`p-2 rounded-full bg-white/50 border border-white/20 shadow-sm shrink-0 h-fit`}>
                                    {getIcon(note.type)}
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="font-bold text-lg leading-snug mb-2 capitalize break-words">
                                        {/* Use mapped heading or try to infer from message if type is generic */}
                                        {getHeading(note)}
                                    </h4>
                                    <p className="text-sm opacity-90 leading-relaxed font-medium break-words whitespace-pre-wrap">
                                        {note.message}
                                    </p>
                                    <p className="text-xs opacity-60 pt-1">
                                        {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDismiss(note._id)}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100 shrink-0 ml-4 -mt-2 -mr-2"
                                title="Dismiss"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
