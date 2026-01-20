import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import CandidateResolverModal from './CandidateResolverModal';

const IngestionDropzone = ({ onUploadSuccess }) => {
    const [uploads, setUploads] = useState([]);
    const [resolverCandidateId, setResolverCandidateId] = useState(null);
    const [isResolverOpen, setIsResolverOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        const newUploads = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            status: 'pending',
            progress: 0,
            name: file.name
        }));

        setUploads(prev => [...newUploads, ...prev]);

        newUploads.forEach(async (upload) => {
            const formData = new FormData();
            formData.append('resume', upload.file);

            try {
                const response = await api.post('/candidates/upload', formData, {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        updateUploadStatus(upload.id, { progress });
                    }
                });

                updateUploadStatus(upload.id, {
                    status: 'success',
                    progress: 100,
                    candidate: response.data.candidate
                });

                toast.success(`Successfully parsed ${upload.name}`);
                if (onUploadSuccess) onUploadSuccess(response.data.candidate);

            } catch (error) {
                // Squelch console error for cleaner UX, checking response handled by UI
                updateUploadStatus(upload.id, { status: 'error' });
                toast.error(`Failed to parse ${upload.name}: ${error.response?.data?.error || 'Server error'}`);
            }
        });
    }, [onUploadSuccess]);

    const updateUploadStatus = (id, updates) => {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const removeUpload = (id) => {
        setUploads(prev => prev.filter(u => u.id !== id));
    };

    const onDropRejected = useCallback((fileRejections) => {
        fileRejections.forEach(({ file, errors }) => {
            toast.error(`${file.name}: ${errors[0].message}`);
        });
    }, []);

    const openResolver = (uploadId) => {
        setResolverCandidateId(uploadId); // Using uploadId as key
        setIsResolverOpen(true);
    };

    const handleLocalUpdate = (updatedData) => {
        setUploads(prev => prev.map(u =>
            u.id === resolverCandidateId
                ? {
                    ...u,
                    status: 'success',
                    candidate: { ...u.candidate, ...updatedData }
                }
                : u
        ));
        toast.success("Candidate updated in staging");
    };

    const handleBatchSave = async () => {
        const validCandidates = uploads
            .filter(u => u.status === 'success' && u.candidate)
            .map(u => u.candidate);

        if (validCandidates.length === 0) {
            toast.error("No valid candidates to save");
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/candidates/batch', { candidates: validCandidates });
            toast.success(`Successfully saved ${validCandidates.length} candidates!`);
            setUploads([]); // Clear staging
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error('Batch save failed:', error);
            toast.error('Failed to save candidates');
        } finally {
            setIsSaving(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 5 * 1024 * 1024
    });

    return (
        <div className="w-full space-y-4">
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                    relative p-12 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
                    ${isDragActive
                        ? 'border-teal-500 bg-teal-50/50'
                        : 'border-slate-300 bg-white hover:border-primary/50 hover:bg-slate-50'}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {isDragActive ? 'Drop them here!' : 'Magic Drop'}
                        </h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                            Drag and drop PDF resumes to start the automated parsing engine.
                        </p>
                    </div>
                </div>

                {/* Magic Sparkle Effect on drag */}
                <AnimatePresence>
                    {isDragActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-teal-500/5 rounded-xl pointer-events-none"
                        >
                            <div className="absolute top-4 right-4 animate-pulse text-teal-500">
                                <FileText className="w-6 h-6" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Upload List (Story 2.4) */}
            <AnimatePresence>
                {uploads.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing Queue</h4>
                            <button
                                onClick={() => setUploads([])}
                                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>

                        {uploads.map((upload) => (
                            <motion.div
                                key={upload.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4"
                            >
                                <div className={`p-2 rounded-lg ${upload.status === 'success' ? 'bg-teal-100 text-teal-600' :
                                    upload.status === 'error' ? 'bg-red-100 text-red-600' :
                                        'bg-slate-100 text-slate-400'
                                    }`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-slate-900 truncate block">
                                                {upload.name}
                                            </span>
                                            {upload.status === 'success' && upload.candidate && (
                                                <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                                                    {upload.candidate.name && (
                                                        <div><span className="font-semibold">Name:</span> {upload.candidate.name}</div>
                                                    )}
                                                    {upload.candidate.email && (
                                                        <div><span className="font-semibold">Email:</span> {upload.candidate.email}</div>
                                                    )}
                                                    {upload.candidate.skills && upload.candidate.skills.length > 0 && (
                                                        <div><span className="font-semibold">Skills:</span> {upload.candidate.skills.slice(0, 3).join(', ')}{upload.candidate.skills.length > 3 ? '...' : ''}</div>
                                                    )}
                                                    {upload.candidate.education && Array.isArray(upload.candidate.education) && upload.candidate.education.length > 0 && (
                                                        <div className="flex flex-col gap-1">
                                                            {upload.candidate.education.map((edu, idx) => (
                                                                <div key={idx}>
                                                                    <span className="font-semibold">{idx === 0 ? 'Education: ' : ''}</span>
                                                                    <span className="text-slate-800">{edu.institute || edu.degree}</span>
                                                                    <span className="text-slate-500 ml-1">({edu.year || 'N/A'})</span>
                                                                    {edu.cgpa && <span className="text-teal-600 ml-2 text-xs font-medium">({edu.cgpa})</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {upload.candidate.parsingConfidence !== undefined && (
                                                        <div className={`font-semibold ${upload.candidate.parsingConfidence < 0.7 ? 'text-amber-600' : 'text-teal-600'}`}>
                                                            Confidence: {Math.round(upload.candidate.parsingConfidence * 100)}%
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {upload.status === 'error' && (
                                                <div className="mt-2 text-xs text-red-500 font-medium">
                                                    Parsing Failed
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 ml-4">
                                            {upload.progress}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${upload.progress}%` }}
                                            className={`h-full transition-colors ${upload.status === 'success' ? 'bg-teal-500' :
                                                upload.status === 'error' ? 'bg-red-500' :
                                                    'bg-primary'
                                                }`}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {upload.status === 'pending' && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
                                    {upload.status === 'success' && (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-teal-500" />
                                            <button
                                                onClick={() => openResolver(upload.id)}
                                                className="text-xs font-bold text-primary hover:underline px-2 py-1"
                                            >
                                                Review
                                            </button>
                                        </>
                                    )}
                                    {upload.status === 'error' && (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <button
                                                onClick={() => openResolver(upload.id)}
                                                className="text-xs font-bold text-primary hover:underline"
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeUpload(upload.id)}
                                        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Save Action Footer */}
                        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                            <button
                                onClick={handleBatchSave}
                                disabled={isSaving || !uploads.some(u => u.status === 'success')}
                                className="
                                    flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all
                                    bg-teal-600 text-white hover:bg-teal-700 active:scale-95
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500
                                "
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving Candidates...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Save All Confirmed ({uploads.filter(u => u.status === 'success').length})
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CandidateResolverModal
                isOpen={isResolverOpen}
                initialData={uploads.find(u => u.id === resolverCandidateId)?.candidate}
                onClose={() => setIsResolverOpen(false)}
                onSave={handleLocalUpdate}
            />
        </div>
    );
};

export default IngestionDropzone;
