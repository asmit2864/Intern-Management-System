import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/Dialog';
import ReviewModal from './components/ReviewModal';
import SendNotificationModal from '../../components/manager/SendNotificationModal';
import { ArrowLeft, RefreshCw, ExternalLink, BookOpen, CheckCircle, Clock, Star, Trash2, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import api from '../../lib/api';
import { toast } from 'sonner';

const InternPerformanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [candidate, setCandidate] = useState(null);
    const [stats, setStats] = useState({
        reviews: [],
        activeTickets: 0
    });
    const [syncLoading, setSyncLoading] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Fetch comprehensive stats for this intern
    const fetchDetails = async () => {
        setLoading(true);
        try {
            // 1. Get Candidate & Jira Snapshot
            const { data: jiraData } = await api.post(`/performance/sync-jira/${id}`);

            // 2. Get Real Training Progress
            const [reviewsRes, candidateRes, trainingRes] = await Promise.all([
                api.get(`/performance/reviews/${id}`),
                api.get(`/candidates/${id}`),
                api.get(`/training/candidate/${id}`)
            ]);

            setCandidate(candidateRes.data.candidate);

            const reviews = reviewsRes.data.reviews;
            // Assuming the latest Jira metrics are in the most recent review
            const latestJira = reviews.length > 0 ? reviews[0].jiraMetrics : { activeTickets: 0, totalTickets: 0 };

            setStats({
                reviews,
                activeTickets: latestJira?.activeTickets || 0,
                totalTickets: latestJira?.totalTickets || 0,
                trainingModules: trainingRes.data.trainings || []
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load intern details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleSyncJira = async () => {
        setSyncLoading(true);
        try {
            await api.post(`/performance/sync-jira/${id}`);
            fetchDetails();
            toast.success('Jira metrics synced');
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setSyncLoading(false);
        }
    };


    const [trainingToDelete, setTrainingToDelete] = useState(null);

    const handleDeleteTraining = async () => {
        if (!trainingToDelete) return;

        try {
            await api.delete(`/training/${trainingToDelete}`);
            toast.success('Training removed');
            fetchDetails(); // Refresh list
            setTrainingToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove training');
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading detailed metrics...</div>;
    if (!stats) return <div className="p-12 text-center text-slate-500">Intern not found</div>;

    const completedTrainings = stats.trainingModules.filter(t => t.status === 'Completed').length;
    const totalTrainings = stats.trainingModules.length;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="w-full space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/tracking')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-2xl font-bold text-slate-900">Performance Details</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsReviewOpen(true)}
                            className={`text-white ${stats.reviews.some(r => {
                                if (!candidate?.internshipStartDate) return false;
                                const start = new Date(candidate.internshipStartDate);
                                const now = new Date();
                                const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
                                const currentWeek = Math.ceil(diffDays / 7) || 1;
                                return Number(r.weekNumber) === currentWeek;
                            }) ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                        >
                            <Star className="w-4 h-4 mr-2" />
                            {stats.reviews.some(r => {
                                if (!candidate?.internshipStartDate) return false;
                                const start = new Date(candidate.internshipStartDate);
                                const now = new Date();
                                const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
                                const currentWeek = Math.ceil(diffDays / 7) || 1;
                                return Number(r.weekNumber) === currentWeek;
                            }) ? "Resubmit Review" : "Submit Review"}
                        </Button>
                        <Button variant="outline" onClick={handleSyncJira} disabled={syncLoading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                            Sync Jira Data
                        </Button>
                        <Button variant="outline" onClick={() => setIsNotificationOpen(true)}>
                            <Bell className="w-4 h-4 mr-2" />
                            Send Notification
                        </Button>
                    </div>
                </div>

                {/* Top Row: Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase">Training Progress</h3>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{completedTrainings}/{totalTrainings} <span className="text-sm text-slate-400">modules</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase">Avg Rating</h3>
                        <p className="text-3xl font-bold text-amber-500 mt-2">
                            {stats.reviews.length > 0
                                ? (stats.reviews.reduce((acc, r) => acc + r.rating.score, 0) / stats.reviews.length).toFixed(1)
                                : '-'}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase">Jira Velocity</h3>
                        <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.activeTickets || 0} <span className="text-sm text-slate-400">pts</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-500 uppercase">Total Tickets</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTickets || 0}</p>
                    </div>
                </div>

                {/* Main Content Grid: Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Col: Training Data */}
                    <div className="relative min-h-[600px]">
                        <div className="absolute inset-0 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 shrink-0">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-slate-800">Training Modules</h3>
                            </div>

                            {stats.trainingModules.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">No training assigned yet.</div>
                            ) : (
                                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {stats.trainingModules.map(module => (
                                        <div key={module._id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-slate-900 line-clamp-1 flex-1 pr-2">{module.title}</h4>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {module.status === 'Completed' ? (
                                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-amber-500" />
                                                    )}
                                                    <button
                                                        onClick={() => setTrainingToDelete(module._id)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                        title="Remove Training"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-slate-500">
                                                <span>Due: {new Date(module.dueDate).toLocaleDateString()}</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${module.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {module.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Jira Data */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-slate-800">Jira Performance (Project)</h3>
                            </div>

                            <h4 className="font-medium text-slate-700 mb-4">Velocity Trend</h4>
                            <div className="h-[250px] mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={[
                                        { week: 'W1', pts: 5 }, // Placeholder history
                                        { week: 'W2', pts: 8 },
                                        { week: 'W3', pts: 12 },
                                        { week: 'W4', pts: stats.activeTickets }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="week" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="pts" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="font-medium text-slate-700 mb-4">Ticket Breakdown</h4>
                                <div className="h-[150px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={[
                                            { name: 'Bugs', val: 0 }, // Placeholder until real data
                                            { name: 'Stories', val: stats.activeTickets || 0 },
                                            { name: 'Tasks', val: 0 }
                                        ]}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="val" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* NEW SECTION: Review History (Manager View) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <Star className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Review History (Admin View)</h3>
                    </div>

                    {stats.reviews.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">No reviews submitted yet.</div>
                    ) : (
                        <div className="grid gap-6">
                            {stats.reviews.map(review => (
                                <div key={review._id} className="p-6 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">Week {review.weekNumber} Review</h4>
                                            <p className="text-sm text-slate-500">Submitted: {new Date(review.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${review.rating.score >= 5 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                            review.rating.score >= 4 ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                review.rating.score >= 3 ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                    'bg-rose-50 border-rose-100 text-rose-600'
                                            }`}>
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold">{review.rating.score}/5</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-1">Feedback (Public)</h5>
                                            <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200">{review.rating.feedback}</p>
                                        </div>

                                        {review.rating.internalNotes && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-amber-600 uppercase mb-1 flex items-center gap-1">
                                                    Internal Notes (Private)
                                                </h5>
                                                <p className="text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm">
                                                    {review.rating.internalNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!trainingToDelete} onOpenChange={(open) => !open && setTrainingToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Training Module?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this training? This action cannot be undone, and the intern will be notified.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setTrainingToDelete(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteTraining}>Remove Training</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Review Modal */}
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    candidateId={id}
                    internName={candidate?.name || "Intern"}
                    onSuccess={fetchDetails}
                    initialData={stats.reviews.find(r => {
                        if (!candidate?.internshipStartDate) return false;
                        const start = new Date(candidate.internshipStartDate);
                        const now = new Date();
                        const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
                        const currentWeek = Math.ceil(diffDays / 7) || 1;
                        return Number(r.weekNumber) === currentWeek;
                    })}
                />

                {/* Send Notification Modal */}
                <SendNotificationModal
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    candidateId={id}
                    candidateName={candidate?.name}
                />
            </div>
        </div >
    );
};

export default InternPerformanceDetail;
