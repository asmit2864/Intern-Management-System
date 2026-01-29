import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import DocumentUploadCard from '../../components/portal/DocumentUploadCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const OnboardingHome = () => {
    const { user } = useAuth();
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const { data } = await api.get('/boarding/status');
            setStatusData(data);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading your profile...</div>;

    const { candidate, documents } = statusData || {};

    // Calculate Progress
    const requiredDocs = ['offer_letter', 'aadhar', 'pan', 'certificate'];
    const uploadedCount = documents?.filter(d => requiredDocs.includes(d.type)).length || 0;
    const progress = Math.round((uploadedCount / requiredDocs.length) * 100);
    const isActive = candidate?.status === 'Active';
    const isReady = candidate?.status === 'Ready to Join';

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-indigo-600 border-indigo-500 text-white">
                <CardContent className="pt-6">
                    <h1 className="text-2xl font-bold mb-2">Welcome, {candidate?.name || 'Intern'}! 👋</h1>
                    <p className="text-indigo-100">
                        {isActive
                            ? "Welcome aboard! Your internship is active. Check your tasks and training modules."
                            : isReady
                                ? "You're all set! We are reviewing your documents. Prepare for your first day!"
                                : "Please complete the onboarding checklist below to confirm your joining."}
                    </p>

                    {/* Joining Date Pill */}
                    {!isActive && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-indigo-500/50 px-4 py-2 rounded-lg text-sm border border-indigo-400">
                            <span className="opacity-75">Target Joining Date:</span>
                            <span className="font-semibold">{candidate?.joiningDate}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Progress Section */}
            {!isReady && !isActive && (
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="font-semibold text-slate-800">Onboarding Progress</h3>
                        <p className="text-sm text-slate-500">{uploadedCount} of {requiredDocs.length} documents uploaded</p>
                    </div>
                    <div className="w-32 h-16 flex items-center justify-center">
                        <div className="text-2xl font-bold text-indigo-600">{progress}%</div>
                    </div>
                </div>
            )}

            {/* Status Alert if needed */}
            {candidate?.status === 'Onboarding' && documents?.some(d => d.status === 'rejected') && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-start gap-3 text-rose-800">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Action Required: Re-upload Requested</p>
                        <p className="text-sm mt-1">
                            The admin has requested you to re-upload some documents. Please check the specific reasons below and upload the correct files.
                        </p>
                    </div>
                </div>
            )}

            {candidate?.status === 'Onboarding' && progress === 100 && !documents?.some(d => d.status === 'rejected') && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm">You have uploaded all documents! HR is currently reviewing them. You will be notified once verified.</p>
                </div>
            )}

            {candidate?.status === 'Ready to Join' && (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-start gap-4 text-emerald-800 shadow-sm">
                    <div className="p-2 bg-emerald-100 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-emerald-900">All Set! You are Ready to Join 🚀</h3>
                        <p className="mt-1 text-emerald-700">
                            Congratulations! All your documents have been verified by the HR team.
                            You will receive further instructions about your first day shortly.
                        </p>
                    </div>
                </div>
            )}

            {/* Checklist Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Document Checklist</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DocumentUploadCard
                        type="offer_letter"
                        title="Signed Offer Letter"
                        description="Upload the PDF copy of the offer letter signed by you."
                        candidateId={candidate?.id}
                        existingDoc={documents?.find(d => d.type === 'offer_letter')}
                        onUploadSuccess={fetchStatus}
                    />

                    <DocumentUploadCard
                        type="aadhar"
                        title="Aadhar Card / Gov ID"
                        description="Standard Government ID proof."
                        candidateId={candidate?.id}
                        existingDoc={documents?.find(d => d.type === 'aadhar')}
                        onUploadSuccess={fetchStatus}
                    />

                    <DocumentUploadCard
                        type="pan"
                        title="PAN Card"
                        description="Permanent Account Number card."
                        candidateId={candidate?.id}
                        existingDoc={documents?.find(d => d.type === 'pan')}
                        onUploadSuccess={fetchStatus}
                    />

                    <DocumentUploadCard
                        type="certificate"
                        title="Latest Education Certificate"
                        description="Degree certificate or final semester mark sheet."
                        candidateId={candidate?.id}
                        existingDoc={documents?.find(d => d.type === 'certificate')}
                        onUploadSuccess={fetchStatus}
                    />
                </div>
            </div>
        </div>
    );
};

export default OnboardingHome;
