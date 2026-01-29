import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { RefreshCw, TrendingUp, Bug, Star, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

const PerformancePage = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/performance/my-reviews');
                if (data.success) {
                    setReviews(data.reviews);
                }
            } catch (error) {
                console.error('Failed to fetch reviews', error);
                toast.error(`Error ${error.response?.status}: ${error.response?.data?.error || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-500">Loading your performance stats...</div>;

    return (
        <div className="w-full space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">My Performance 🚀</h1>
                <p className="text-slate-500">View your weekly feedback and growth.</p>
            </header>



            {reviews.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
                    <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                        <TrendingUp className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reviews Yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Your manager hasn't submitted a weekly review yet.
                        Keep focusing on your training tasks!
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Week {review.weekNumber} Feedback</h3>
                                    <p className="text-sm text-slate-500">
                                        Received on {new Date(review.updatedAt).toLocaleDateString()}
                                    </p>
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

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Manager Feedback</h4>
                                <p className="text-slate-700 leading-relaxed">
                                    {review.rating.feedback || "No written feedback provided."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PerformancePage;
