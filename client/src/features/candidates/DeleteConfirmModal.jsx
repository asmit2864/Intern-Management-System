import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, candidateName, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-[101]"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Candidate?</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Are you sure you want to delete <span className="font-semibold text-slate-900">{candidateName}</span>?
                                        This action will permanently remove all their data from the database and cannot be undone.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 px-6 flex justify-end gap-3 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="bg-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={onConfirm}
                                isLoading={isLoading}
                                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-200 transition-all active:scale-95"
                            >
                                Delete Permanently
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteConfirmModal;
