import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, PlayCircle, Clock, Link as LinkIcon, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const TrainingBoard = () => {
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTraining = async () => {
        try {
            const { data } = await api.get('/training/my-learning');
            if (data.success) {
                setTrainings(data.trainings);
            }
        } catch (error) {
            console.error('Failed to load training:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTraining();
    }, []);

    const handleComplete = async (id) => {
        try {
            await api.patch(`/training/${id}/complete`);
            toast.success('Module Completed! 🎉');
            fetchTraining();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="w-full space-y-6">

            <h1 className="text-2xl font-bold text-slate-900">My Learning Path 📚</h1>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading modules...</div>
                ) : trainings.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
                        <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Training Assigned</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Your manager hasn't assigned any training modules yet.
                            Relax and check back later!
                        </p>
                    </div>
                ) : (
                    trainings.map((module) => (
                        <div key={module._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between gap-4 transition-all hover:shadow-md">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg text-slate-900">{module.title}</h3>
                                </div>
                                <p className="text-slate-600 text-sm">{module.description || 'No description provided.'}</p>

                                {module.resources && module.resources.length > 0 ? (
                                    <div className="flex flex-col gap-2 mt-3">
                                        {module.resources.map((res, idx) => {
                                            const formattedUrl = res.type === 'file'
                                                ? `http://localhost:5000/${res.url}`
                                                : (res.url.startsWith('http') ? res.url : `https://${res.url}`);

                                            return (
                                                <a
                                                    key={idx}
                                                    href={formattedUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                                >
                                                    {res.type === 'file' ? <FileText className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                                                    {res.label}
                                                </a>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    // Fallback for old data or empty
                                    module.resourceLink && (
                                        <a
                                            href={module.resourceLink.startsWith('http') ? module.resourceLink : `https://${module.resourceLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2"
                                        >
                                            <PlayCircle className="w-4 h-4 mr-1.5" />
                                            View Resource
                                        </a>
                                    )
                                )}

                                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                                    {module.dueDate && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Due: {new Date(module.dueDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${module.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {module.status}
                                </span>

                                {module.status !== 'Completed' ? (
                                    <Button onClick={() => handleComplete(module._id)} className="w-full sm:w-auto">
                                        Mark as Complete
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-600 font-medium px-4 py-2 bg-emerald-50 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Done
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TrainingBoard;
