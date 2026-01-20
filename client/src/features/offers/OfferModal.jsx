import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ArrowLeft, Send, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/api';
import { toast } from 'sonner';

const OfferModal = ({ isOpen, onClose, candidate, onOfferSent }) => {
    const [step, setStep] = useState(1); // 1: Details, 2: Preview
    const [loading, setLoading] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);

    // Default Dates
    const today = new Date().toISOString().split('T')[0];
    const defaultExpiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultJoining = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        offerDate: today,
        joiningDate: defaultJoining,
        expiryDate: defaultExpiry
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPdfBlob(null);
        }
    }, [isOpen]);

    const handleGeneratePreview = async () => {
        if (!formData.joiningDate || !formData.expiryDate) {
            toast.error('Please select all dates');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/offers/preview', {
                candidateName: candidate.name,
                ...formData
            }, {
                responseType: 'blob'
            });

            setPdfBlob(response.data);
            setStep(2);
        } catch (error) {
            console.error('Preview generation failed:', error);
            toast.error('Failed to generate preview');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOffer = async () => {
        setLoading(true);
        try {
            await api.post('/offers/send', {
                candidateId: candidate._id,
                ...formData
            });
            toast.success('Offer sent successfully!');
            onOfferSent();
            onClose();
        } catch (error) {
            console.error('Failed to send offer:', error);
            toast.error('Failed to send offer email');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col ${step === 2 ? 'w-full max-w-5xl h-[90vh]' : 'w-full max-w-lg'}`}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    {step === 1 ? 'Configure Offer' : 'Preview Offer'}
                                </h3>
                                <div className="text-xs text-slate-500">
                                    For {candidate.name}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {step === 1 ? (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Offer Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="date"
                                            className="pl-9"
                                            value={formData.offerDate}
                                            onChange={(e) => setFormData({ ...formData, offerDate: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">The date displayed on the top of the letter.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Joining Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="date"
                                            className="pl-9"
                                            value={formData.joiningDate}
                                            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Target joining date for the candidate.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Acceptance Deadline</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="date"
                                            className="pl-9"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Usually 3-7 days from today.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative group">
                                {pdfBlob && (
                                    <iframe
                                        src={URL.createObjectURL(pdfBlob) + '#toolbar=0'} // Hide toolbar for cleaner look
                                        className="w-full h-full"
                                        title="Offer Preview"
                                    />
                                )}
                                {!pdfBlob && (
                                    <div className="flex items-center justify-center h-full text-slate-400">Loading Preview...</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        {step === 1 ? (
                            <>
                                <Button variant="outline" onClick={onClose}>Cancel</Button>
                                <Button onClick={handleGeneratePreview} disabled={loading} className="px-6">
                                    {loading ? 'Generating...' : 'Preview Offer'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Edit Details
                                </Button>
                                <Button onClick={handleSendOffer} disabled={loading} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200">
                                    {loading ? 'Sending...' : (
                                        <>
                                            <Send className="w-4 h-4" /> Send Offer
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OfferModal;
