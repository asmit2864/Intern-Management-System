import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const REJECTION_REASONS = [
    "Skill - Technical Mismatch",
    "Skill - Experience Mismatch",
    "Culture Fit",
    "Communication Skills",
    "Budget Constraints",
    "Position Filled",
    "Offer Declined by Candidate",
    "Did Not Show Up",
    "Other"
];

const RejectionModal = ({ isOpen, onClose, onConfirm, candidateName, isLoading }) => {
    const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
    const [customReason, setCustomReason] = useState("");
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        let finalReason = selectedReason;
        if (selectedReason === "Other") {
            if (!customReason.trim()) {
                setError("Please specify a reason.");
                return;
            }
            finalReason = customReason;
        }

        onConfirm(finalReason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Reject Candidate
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-red-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-slate-600 text-sm">
                        Are you sure you want to reject <span className="font-semibold text-slate-900">{candidateName}</span>?
                        This action will close their application.
                    </p>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Reason for Rejection
                        </label>
                        <select
                            value={selectedReason}
                            onChange={(e) => {
                                setSelectedReason(e.target.value);
                                setError("");
                            }}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {REJECTION_REASONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {selectedReason === "Other" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Specify Reason
                            </label>
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Enter specific reason..."
                                className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                            />
                        </div>
                    )}

                    {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm border-0"
                    >
                        {isLoading ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;
