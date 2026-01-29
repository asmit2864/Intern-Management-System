import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { LogOut, ShieldCheck, FileText, BookOpen, TrendingUp, LayoutDashboard, Bell } from 'lucide-react';

const PortalLayout = () => {
    const { user, logout } = useAuth();
    const { hasUnread, hasNotifications } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Top Bar */}
            <header className="bg-white border-b border-slate-200">
                <div className="w-full px-8 pt-8 pb-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <LayoutDashboard className="w-8 h-8" />
                            <h1 className="text-3xl font-bold text-indigo-600 font-sans tracking-tight">
                                Intern Dashboard
                            </h1>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex bg-white rounded-lg p-1 border shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/portal')}
                                className={`h-auto py-2 ${location.pathname === '/portal' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <FileText className="w-3.5 h-3.5 mr-2" />
                                Documents
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/portal/training')}
                                className={`h-auto py-2 ${location.pathname.startsWith('/portal/training') ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <BookOpen className="w-3.5 h-3.5 mr-2" />
                                My Learning
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/portal/performance')}
                                className={`h-auto py-2 ${location.pathname.startsWith('/portal/performance') ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <TrendingUp className="w-3.5 h-3.5 mr-2" />
                                My Performance
                            </Button>

                            {/* Divider or Spacer could act as 'appropriate space' but flex gap handles it */}
                            <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/portal/notifications')}
                                className={`h-9 w-9 relative ${location.pathname === '/portal/notifications' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {hasUnread ? (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                ) : hasNotifications ? (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border border-white"></span>
                                ) : null}
                            </Button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">
                            Logged in as <span className="font-semibold text-slate-900">{user?.email}</span>
                        </span>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default PortalLayout;
