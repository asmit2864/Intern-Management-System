import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import IngestionDropzone from '../features/candidates/IngestionDropzone';
import CandidateList from '../features/candidates/CandidateList';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({
        totalCandidates: 0,
        assessment: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/candidates/stats');
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, [refreshTrigger]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Prepare Chart Data
    // Prepare Chart Data
    // Prepare Chart Data
    const chartData = [
        { name: 'Assessment', value: stats.assessment, color: '#3b82f6' }, // Blue-500
        { name: 'Interview', value: stats.interview, color: '#8b5cf6' },  // Violet-500
        { name: 'Offered', value: stats.offer, color: '#d946ef' },      // Fuchsia-500
        { name: 'Hired', value: stats.hired, color: '#10b981' },      // Emerald-500
        { name: 'Rejected', value: stats.rejected, color: '#f43f5e' }   // Rose-500
    ].filter(item => item.value > 0);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                <header className="flex justify-between items-center mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold text-slate-900 font-sans tracking-tight">
                        Intern Management Hub
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">
                            Logged in as <span className="font-semibold text-slate-900">{user?.email}</span>
                        </span>
                        <Button variant="outline" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </header>

                <main className="space-y-8">
                    {/* Top Section: Stats Grid + Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: 3x2 Stats Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Row 1 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Candidates</h2>
                                <p className="text-4xl font-bold text-slate-900">{stats.totalCandidates}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">In Assessment</h2>
                                <p className="text-4xl font-bold text-blue-500">{stats.assessment}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Interviewing</h2>
                                <p className="text-4xl font-bold text-violet-500">{stats.interview}</p>
                            </div>

                            {/* Row 2 */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Offers Sent</h2>
                                <p className="text-4xl font-bold text-fuchsia-500">{stats.offer}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Hired</h2>
                                <p className="text-4xl font-bold text-emerald-500">{stats.hired}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                                <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Rejected</h2>
                                <p className="text-4xl font-bold text-rose-500">{stats.rejected}</p>
                            </div>
                        </div>

                        {/* Right Column: Animated Donut Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
                            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4 w-full text-left">Status Overview</h2>
                            <div className="w-full h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-full mx-auto space-y-8">
                        {/* Ingestion Section */}
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-bold">1</span>
                                Upload Resumes
                            </h2>
                            <IngestionDropzone onUploadSuccess={handleUploadComplete} />
                        </div>

                        {/* Candidate List Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                                Recent Applicants
                            </h2>
                            <CandidateList
                                refreshTrigger={refreshTrigger}
                                onDeleteSuccess={handleUploadComplete}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
