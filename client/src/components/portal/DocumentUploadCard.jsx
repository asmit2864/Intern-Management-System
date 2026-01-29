import { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, Clock, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import api from '../../lib/api';

const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'Pending Verification' },
    verified: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'Verified' },
    rejected: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', text: 'Rejected' },
    missing: { icon: Upload, color: 'text-slate-400', bg: 'bg-white', border: 'border-slate-200', text: 'Not Uploaded' }
};

const DocumentUploadCard = ({ type, title, description, existingDoc, candidateId, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const docStatus = existingDoc ? existingDoc.status : 'missing';
    const config = statusConfig[docStatus];
    const StatusIcon = config.icon;

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large (Max 5MB)');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('candidateId', candidateId);

        try {
            await api.post('/boarding/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${title} uploaded successfully!`);
            onUploadSuccess();
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleTriggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDownload = async () => {
        if (!existingDoc) return;
        try {
            // Secure download via API
            window.open(`${import.meta.env.VITE_API_URL}/boarding/file/${existingDoc._id}`, '_blank');
        } catch (error) {
            toast.error('Failed to open file');
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${docStatus === 'missing' ? 'border-slate-200 border-dashed' : config.border} ${config.bg} transition-all`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${docStatus === 'missing' ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                        <FileText className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{title}</h4>
                        <p className="text-sm text-slate-500">{description}</p>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.border} ${config.bg} ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {config.text}
                        </div>

                        {/* Rejection Reason */}
                        {docStatus === 'rejected' && existingDoc.rejectionReason && (
                            <p className="mt-2 text-xs text-rose-600 bg-rose-100/50 p-2 rounded border border-rose-100">
                                <strong>Reason:</strong> {existingDoc.rejectionReason}
                            </p>
                        )}

                        {/* File Name if exists */}
                        {existingDoc && (
                            <p className="mt-1 text-xs text-slate-400 truncate max-w-[200px]">
                                {existingDoc.originalName}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                    />

                    {/* Upload Button */}
                    {(docStatus === 'missing' || docStatus === 'rejected' || docStatus === 'pending') && (
                        <Button
                            size="sm"
                            variant={docStatus === 'missing' ? 'default' : 'outline'}
                            onClick={handleTriggerUpload}
                            disabled={uploading}
                            className={docStatus === 'missing' ? 'bg-indigo-600' : ''}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin mr-2" /> Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-3 h-3 mr-2" /> {docStatus === 'missing' ? 'Upload' : 'Re-upload'}
                                </>
                            )}
                        </Button>
                    )}

                    {/* View Button */}
                    {existingDoc && (
                        <Button size="sm" variant="ghost" onClick={handleDownload}>
                            View File
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadCard;
