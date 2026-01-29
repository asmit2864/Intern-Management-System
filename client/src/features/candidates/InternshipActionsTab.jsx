import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Rocket, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const InternshipActionsTab = ({ candidate, onUpdate }) => {
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleStartInternship = async () => {
        // Confirmation is now handled by modal logic before calling this
        // if (!confirm('Are you sure you want to activate this internship? This will unlock the Performance Tracker.')) return;

        setActionLoading(true);
        try {
            const { data } = await api.post('/performance/start-internship', { candidateId: candidate._id });
            if (data.success) {
                toast.success('Internship Activated! 🚀');
                onUpdate(); // Refresh to show new status
                navigate('/tracking');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to start internship');
        } finally {
            setActionLoading(false);
        }
    };

    if (candidate.status === 'Active') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-emerald-50 rounded-lg border border-dashed border-emerald-200">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                    <Rocket className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Internship Active</h3>
                <p className="text-slate-600 max-w-sm mb-6">
                    This candidate is now an active intern. You can track their progress and performance in the dashboard.
                </p>
                <Button onClick={() => navigate('/tracking')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Go to Tracking Dashboard
                </Button>
            </div>
        );
    }

    if (candidate.status === 'Ready to Join') {
        return (
            <>
                <div className="flex flex-col items-center justify-center py-12 text-center bg-emerald-50 rounded-lg border border-dashed border-emerald-200">
                    <div className="bg-emerald-100 p-3 rounded-full mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Ready to Start Internship</h3>
                    <p className="text-slate-600 max-w-sm mb-6">
                        All documents are verified. The candidate is ready to join the team.
                    </p>
                    <Button onClick={() => setIsConfirmOpen(true)} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Start Internship 🚀
                    </Button>
                </div>

                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handleStartInternship}
                    title="Start Internship?"
                    description="Are you sure you want to activate this internship? This will unlock the Performance Tracker and mark the candidate as an Active Intern."
                    confirmText="Activate Internship"
                    variant="success"
                    isLoading={actionLoading}
                />
            </>
        );
    }

    // Default state for other statuses (Onboarding, Offer, Interview, etc.)
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="bg-slate-100 p-3 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Not Ready Yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">
                Complete the onboarding process and document verification before starting the internship.
            </p>
        </div>
    );
};

export default InternshipActionsTab;
