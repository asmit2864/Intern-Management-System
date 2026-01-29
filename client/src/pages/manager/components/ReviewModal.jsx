import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { X, Star } from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'sonner';

const ReviewModal = ({ isOpen, onClose, candidateId, internName, onSuccess, initialData }) => {
    const [score, setScore] = useState(3);
    const [feedback, setFeedback] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load initial data if provided (Edit Mode)
    useEffect(() => {
        if (isOpen && initialData) {
            setScore(initialData.rating.score);
            setFeedback(initialData.rating.feedback);
            setInternalNotes(initialData.rating.internalNotes || '');
        } else if (isOpen) {
            // Reset if opening new
            setScore(3);
            setFeedback('');
            setInternalNotes('');
        }
    }, [isOpen, initialData]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/performance/review', {
                candidateId,
                score: Number(score),
                feedback,
                internalNotes
            });
            toast.success('Review submitted successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Weekly Review: {internName}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Score Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Overall Rating (1-5)
                        </label>
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setScore(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${score >= star
                                                    ? 'fill-amber-400 text-amber-500'
                                                    : 'fill-slate-100 text-slate-300'
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${score >= 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    score >= 4 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        score >= 3 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                    {score >= 5 ? 'Excellent 🌟' :
                                        score >= 4 ? 'Very Good 🚀' :
                                            score >= 3 ? 'Good 👍' :
                                                score >= 2 ? 'Needs Improvement ⚠️' : 'Poor 🛑'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Public Feedback */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Feedback (Visible to Intern)
                        </label>
                        <textarea
                            className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Great work on the frontend tasks. Keep improving code comments."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                        />
                    </div>

                    {/* Internal Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Internal Notes (Private)
                        </label>
                        <textarea
                            className="w-full flex min-h-[60px] rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="Discussed punctuality issues. Seemed receptive."
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;
