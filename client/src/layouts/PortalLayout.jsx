import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { LogOut, ShieldCheck, FileText, BookOpen, TrendingUp, LayoutDashboard, Bell } from 'lucide-react';
import LiquidTabs from '../components/ui/LiquidTabs';

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
                        {/* Navigation Menu */}
                        <LiquidTabs
                            activeId={
                                location.pathname.startsWith('/portal/training') ? '/portal/training' :
                                    location.pathname.startsWith('/portal/performance') ? '/portal/performance' :
                                        location.pathname.startsWith('/portal/notifications') ? null :
                                            '/portal'
                            }
                            tabs={[
                                { id: '/portal', label: 'Documents', icon: FileText },
                                { id: '/portal/training', label: 'My Learning', icon: BookOpen },
                                { id: '/portal/performance', label: 'My Performance', icon: TrendingUp }
                            ]}
                        />

                        {/* Notifications (Separate Icon) */}
                        <div className="w-px h-6 bg-slate-200 mx-2 self-center"></div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/portal/notifications')}
                            className={`h-11 w-11 relative rounded-full border transition-all duration-300 ${location.pathname === '/portal/notifications'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md'
                                }`}
                        >
                            <Bell className="w-5 h-5" />
                            {hasUnread ? (
                                <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                                </span>
                            ) : hasNotifications ? (
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-amber-400 rounded-full border-2 border-white"></span>
                            ) : null}
                        </Button>
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
