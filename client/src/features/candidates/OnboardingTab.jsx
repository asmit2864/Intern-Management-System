import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CheckCircle2, XCircle, FileText, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const OnboardingTab = ({ candidate, onUpdate }) => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchDocuments = async (showToast = false) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/boarding/candidate/${candidate._id}`);
            if (data.success) {
                setDocuments(data.documents);
                if (showToast) toast.success('Documents refreshed');
            }
        } catch (error) {
            console.error('Failed to load docs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch documents when tab loads
    useEffect(() => {
        if (candidate.status === 'Onboarding' || candidate.status === 'Ready to Join' || candidate.status === 'Active') {
            fetchDocuments(false);
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate._id, candidate.status]);

    const handleEnableOnboarding = async () => {
        setActionLoading('enable');
        try {
            await api.post('/boarding/enable', { candidateId: candidate._id });
            toast.success('Onboarding enabled! Email sent to candidate.');
            setRejectDialogOpen(false); // Close modal on success
            onUpdate(); // Trigger refresh of candidate details
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to enable onboarding');
        } finally {
            setActionLoading(null);
        }
    };

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const openRejectDialog = (docId) => {
        setSelectedDocId(docId);
        setRejectReason('');
        setRejectDialogOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        await handleVerify(selectedDocId, 'rejected', rejectReason);
        setRejectDialogOpen(false);
    };

    const handleVerify = async (docId, status, reason = '') => {
        setActionLoading(docId);
        try {
            await api.patch(`/boarding/verify/${docId}`, { status, reason });
            toast.success(`Document ${status}`);

            // Optimistic update
            setDocuments(prev => prev.map(d =>
                d._id === docId ? { ...d, status, rejectionReason: reason } : d
            ));
        } catch (error) {
            toast.error('Verification failed');
        } finally {
            setActionLoading(null);
        }
    };

    const openDocument = (docId) => {
        window.open(`${import.meta.env.VITE_API_URL}/boarding/file/${docId}`, '_blank');
    };





    // Base UI for different states
    const renderContent = () => {
        if (candidate.status !== 'Onboarding' && candidate.status !== 'Ready to Join' && candidate.status !== 'Active') {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <div className="bg-indigo-50 p-3 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Start Onboarding</h3>
                    <p className="text-slate-500 max-w-sm mb-6">
                        Candidate has accepted the offer. Enable onboarding to allow them to upload documents.
                    </p>
                    <Button onClick={() => setRejectDialogOpen('start_onboarding')} disabled={actionLoading === 'enable'}>
                        {actionLoading === 'enable' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Enable Onboarding Workflow
                    </Button>
                </div>
            );
        }

        if (loading && documents.length === 0) return <div className="p-8 text-center">Loading documents...</div>;

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Uploaded Documents</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => fetchDocuments(true)} title="Refresh Documents">
                            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <div className="text-sm text-slate-500">
                            {documents.filter(d => d.status === 'verified').length} / {documents.length} Verified
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {documents.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                            No documents uploaded by intern yet.
                        </div>
                    ) : (
                        documents.map(doc => (
                            <div key={doc._id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${doc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 capitalize">{doc.type.replace('_', ' ')}</p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-slate-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            {doc.status === 'rejected' && doc.rejectionReason && (
                                                <p className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 inline-block w-fit">
                                                    Reason: {doc.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="sm" onClick={() => openDocument(doc._id)} className="text-indigo-600 hover:text-indigo-700">
                                        <ExternalLink className="w-4 h-4 mr-1" /> View
                                    </Button>

                                    {doc.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                                                onClick={() => openRejectDialog(doc._id)}
                                                disabled={!!actionLoading}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => handleVerify(doc._id, 'verified')}
                                                disabled={!!actionLoading}
                                            >
                                                {actionLoading === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                                Verify
                                            </Button>
                                        </>
                                    )}

                                    {doc.status === 'verified' && (
                                        <>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                Verified
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                onClick={() => openRejectDialog(doc._id)}
                                                title="Request Re-upload"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-1" /> Re-upload
                                            </Button>
                                        </>
                                    )}
                                    {doc.status === 'rejected' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                            Rejected
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderContent()}

            {/* Confirmation Modal for Starting Onboarding */}
            <ConfirmationModal
                isOpen={rejectDialogOpen === 'start_onboarding'}
                onClose={() => setRejectDialogOpen(false)}
                onConfirm={handleEnableOnboarding}
                title="Start Onboarding Process?"
                description="This will send an email to the candidate with login credentials and instructions to upload their documents. Are you sure you want to proceed?"
                confirmText="Start Onboarding"
                variant="primary"
                isLoading={actionLoading === 'enable'}
            />

            {/* Rejection Dialog */}
            {typeof rejectDialogOpen === 'boolean' && rejectDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Request Re-upload / Reject</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Please provide a reason. The intern will see this message and be asked to re-upload.
                        </p>
                        <textarea
                            className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm mb-4"
                            placeholder="e.g. Image is blurry, Wrong document type..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleRejectSubmit} className="bg-rose-600 hover:bg-rose-700 text-white">
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OnboardingTab;
