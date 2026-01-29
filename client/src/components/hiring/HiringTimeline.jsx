import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Circle, Clock, Plus, ChevronRight,
    User, XCircle, Star, Rocket, Terminal, ShieldCheck, Heart, ChevronDown, Pencil
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const ROUND_TYPES = [
    { id: 'Assessment', color: 'bg-blue-500', icon: Star },
    { id: 'GD', color: 'bg-purple-500', icon: User },
    { id: 'Technical', color: 'bg-indigo-500', icon: Terminal },
    { id: 'Managerial', color: 'bg-amber-500', icon: ShieldCheck },
    { id: 'HR', color: 'bg-rose-500', icon: Heart }
];

export const HiringTimeline = ({ candidate, onUpdate }) => {
    const [isAddingRound, setIsAddingRound] = useState(false);
    const [selectedType, setSelectedType] = useState('Assessment');
    const [isDragging, setIsDragging] = useState(false);


    const rounds = candidate.rounds || [];

    const handleAddRound = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const res = await api.post(`/candidates/${candidate._id}/rounds`, {
                type: formData.get('type'),
                name: formData.get('name'),
                interviewer: formData.get('interviewer')
            });
            onUpdate(res.data.candidate);
            setIsAddingRound(false);
            toast.success('Round added successfully');
        } catch (error) {
            toast.error('Failed to add round');
        }
    };

    const isPipelineFrozen = ['Offer', 'Onboarding', 'Ready to Join', 'Active', 'Rejected'].includes(candidate.status);

    const onDropRound = (type) => {
        if (isPipelineFrozen) return;
        setSelectedType(type);
        setIsAddingRound(true);
    };

    return (
        <div className="bg-white border border-slate-200 shadow-sm select-none relative z-0">
            {/* Draggable Shelf */}
            {!isPipelineFrozen && (
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Build Pipeline</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Drag a round type tile and drop it into the timeline below</p>
                        </div>

                        <div className="flex gap-4 overflow-visible">
                            {ROUND_TYPES.map((type) => (
                                <motion.div
                                    key={type.id}
                                    drag
                                    dragMomentum={false}
                                    dragElastic={0}
                                    dragSnapToOrigin
                                    transition={{ type: "just" }}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={(e, info) => {
                                        setIsDragging(false);
                                        if (info.offset.y > 60) {
                                            onDropRound(type.id);
                                        }
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    whileDrag={{
                                        scale: 1.15,
                                        zIndex: 1000,
                                        boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)"
                                    }}
                                    className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md shrink-0 relative"
                                >
                                    <div className={`w-2 h-2 rounded-full ${type.color}`}></div>
                                    <span className="text-xs font-bold text-slate-700">{type.id}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Snake Pattern Pipeline */}
                <div className="flex flex-col gap-12">
                    {(() => {
                        const nodes = [
                            { type: 'start', label: 'Shortlisted' },
                            ...rounds.map(r => ({ type: 'round', data: r })),
                            ...(isPipelineFrozen ? [] : [{ type: 'dropzone' }]),
                            { type: 'offer', label: 'Offer' }
                        ];

                        const itemsPerRow = 5;
                        const rows = [];
                        for (let i = 0; i < nodes.length; i += itemsPerRow) {
                            rows.push(nodes.slice(i, i + itemsPerRow));
                        }

                        return rows.map((row, rowIndex) => {
                            const isLastRow = rowIndex === rows.length - 1;
                            const isReversed = rowIndex % 2 !== 0;

                            return (
                                <div key={rowIndex} className="relative">
                                    {/* Horizontal Connection Line for the row */}
                                    <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-300 z-0"></div>

                                    <div className={`flex items-start justify-between px-4 ${isReversed ? 'flex-row-reverse' : ''}`}>
                                        {row.map((node, nodeIndex) => {
                                            const originalIndex = isReversed ? (rowIndex * itemsPerRow) + (row.length - 1 - nodeIndex) : (rowIndex * itemsPerRow) + nodeIndex;

                                            // Render logic based on node type
                                            if (node.type === 'start') {
                                                return (
                                                    <div key="start" className="relative z-10 flex flex-col items-center bg-white px-2">
                                                        <div className="h-12 flex items-center">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 ring-4 ring-emerald-50 border-2 border-emerald-500">
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            </div>
                                                        </div>
                                                        <span className="mt-2 text-[10px] font-black uppercase text-emerald-600 tracking-widest">Shortlisted</span>
                                                    </div>
                                                );
                                            }

                                            if (node.type === 'round') {
                                                const roundType = ROUND_TYPES.find(r => r.id === node.data.type) || ROUND_TYPES[0];
                                                const Icon = roundType.icon;
                                                const status = node.data.status;

                                                const isPassed = status === 'Passed';

                                                // Check for manual rejection on this specific stage
                                                // It is the "Current Stage" if it is the first Pending round and candidate is rejected
                                                const isFirstPending = status === 'Pending' &&
                                                    rounds.findIndex(r => r.status === 'Pending') === rounds.findIndex(r => r._id === node.data._id);

                                                // Visual Failure: Explicit Fail OR Manual Rejection at this stage
                                                const isFailed = status === 'Failed' || (candidate.status === 'Rejected' && isFirstPending);

                                                return (
                                                    <div key={node.data._id || nodeIndex} className="relative z-10 flex flex-col items-center group bg-white px-2">
                                                        <div className="h-12 flex items-center">
                                                            <div className={`
                                                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                                                                ${isPassed ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50' :
                                                                    isFailed ? 'bg-rose-600 text-white shadow-lg shadow-rose-100 ring-4 ring-rose-50' :
                                                                        'bg-white border-2 border-slate-300 text-slate-500 rotate-12 group-hover:rotate-0'}
                                                            `}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                        <span className={`mt-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${isPassed ? 'text-indigo-600' : isFailed ? 'text-rose-600' : 'text-slate-600'}`}>
                                                            {node.data.type}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            if (node.type === 'dropzone') {
                                                return (
                                                    <div key="dropzone" className="relative z-10 px-2 bg-white">
                                                        <div className="h-12 flex items-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedType('Assessment');
                                                                    setIsAddingRound(true);
                                                                }}
                                                                className={`
                                                                h-12 w-44 border-[2.5px] border-dashed rounded-2xl flex items-center justify-center transition-all duration-500
                                                                ${isDragging
                                                                        ? 'border-indigo-500 bg-indigo-50/80 scale-105 shadow-[0_0_30px_rgba(79,70,229,0.2)] animate-pulse'
                                                                        : 'border-slate-400 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-500 hover:scale-[1.02]'
                                                                    }
                                                            `}>
                                                                <div className={`flex items-center gap-3 ${isDragging ? 'text-indigo-600' : 'text-slate-600'}`}>
                                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDragging ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                                                                        <Plus className={`w-3.5 h-3.5 ${isDragging ? 'animate-spin' : ''}`} />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isDragging ? 'Drop Here' : 'Add Round'}</span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (node.type === 'offer') {
                                                const isOffered = ['Offer', 'Onboarding', 'Ready to Join', 'Active'].includes(candidate.status);
                                                return (
                                                    <div key="offer" className="relative z-10 flex flex-col items-center bg-white px-2">
                                                        <div className="h-12 flex items-center">
                                                            <div className={`
                                                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700
                                                                ${isOffered
                                                                    ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-4 ring-amber-50'
                                                                    : 'bg-white border-2 border-slate-300 text-slate-400'
                                                                }
                                                            `}>
                                                                <Rocket className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                        <span className={`mt-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${isOffered ? 'text-amber-600' : 'text-slate-600'}`}>
                                                            Offer
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div>

                                    {/* Straight Vertical Connector */}
                                    {!isLastRow && (
                                        <div className={`
                                            absolute top-6 h-20 w-0.5 bg-slate-300
                                            ${isReversed ? 'left-[48px]' : 'right-[48px]'}
                                        `} style={{ height: 'calc(100% + 48px)' }}></div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className="mt-12 space-y-6">
                    {rounds.length > 0 && (
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-900 text-lg">Evaluations</h3>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>
                    )}
                    {rounds.length > 0 ? (
                        rounds.map((round, idx) => {
                            const isLocked = idx > 0 && rounds[idx - 1].status === 'Pending';

                            // Check if this is the specific round where manual rejection "stopped" the process
                            const isFirstPending = round.status === 'Pending' &&
                                rounds.findIndex(r => r.status === 'Pending') === idx;
                            const isTerminated = candidate.status === 'Rejected' && isFirstPending;

                            return (
                                <RoundCard
                                    key={idx}
                                    round={round}
                                    candidateId={candidate._id}
                                    onUpdate={onUpdate}
                                    isLocked={isLocked}
                                    isFrozen={isPipelineFrozen}
                                    isTerminated={isTerminated}
                                />
                            );
                        })
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                                <Rocket className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">Pipeline is Empty</h4>
                            <p className="text-sm text-slate-500 mb-0">Drag a round from the shelf into the timeline to start</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Round Modal */}
            <AnimatePresence>
                {isAddingRound && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden relative"
                        >
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${ROUND_TYPES.find(t => t.id === selectedType)?.color}`}></div>

                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Schedule {selectedType} Round</h3>
                                <button onClick={() => setIsAddingRound(false)} className="text-slate-400 hover:text-slate-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleAddRound} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Select Round Type</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {ROUND_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            const isSelected = selectedType === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={`
                                                        flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all
                                                        ${isSelected
                                                            ? `${type.color.replace('bg-', 'border-')} bg-slate-50 shadow-sm`
                                                            : 'border-slate-100 bg-white hover:border-slate-200'}
                                                    `}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? type.color : 'bg-slate-100'} ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{type.id}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <input type="hidden" name="type" value={selectedType} />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject / Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        placeholder={`e.g. ${selectedType} Interview`}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold placeholder:font-normal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Interviewer</label>
                                    <input
                                        name="interviewer"
                                        type="text"
                                        required
                                        placeholder="Interviewer Name"
                                        className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold placeholder:font-normal"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingRound(false)}
                                        className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 text-sm bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-100"
                                    >
                                        Confirm Round
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RoundCard = ({ round, candidateId, onUpdate, isLocked, isFrozen, isTerminated }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(round.status === 'Pending' ? 'Passed' : round.status);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const res = await api.patch(`/candidates/${candidateId}/rounds/${round._id}`, {
                feedback: formData.get('feedback'),
                score: Number(formData.get('score')),
                status: selectedStatus // Use state directly or formData.get('status')
            });

            onUpdate(res.data.candidate);
            setIsEditing(false);
            toast.success('Evaluation Completed');
        } catch (error) {
            toast.error('Failed to save evaluation');
        }
    };

    return (
        <div className={`
            bg-white border rounded-2xl p-5 hover:shadow-md transition-all duration-300 group
            ${round.status === 'Passed' ? 'border-teal-200 shadow-sm shadow-teal-50' :
                (round.status === 'Failed' || isTerminated) ? 'border-rose-200 shadow-sm shadow-rose-50' :
                    'border-slate-200'}
            ${isLocked ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : ''}
        `}>
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
                        {round.interviewer ? (
                            <div className={`w-full h-full ${(round.status === 'Failed' || isTerminated) ? 'bg-rose-500' : 'bg-indigo-500'} text-white flex items-center justify-center font-bold text-lg`}>
                                {round.interviewer.charAt(0)}
                            </div>
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{round.name}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${ROUND_TYPES.find(t => t.id === round.type)?.color || 'bg-slate-500'} text-white shadow-sm`}>
                                {round.type}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                            {round.interviewer || 'Unassigned'} • {new Date(round.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    {round.status === 'Pending' ? (
                        <div className={`
                            px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5
                            ${isTerminated ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}
                        `}>
                            {isLocked ? (
                                <>
                                    <Clock className="w-3 h-3" /> Locked
                                </>
                            ) : isFrozen ? (
                                <>
                                    <XCircle className="w-3 h-3" /> Terminated
                                </>
                            ) : (
                                <>
                                    <Clock className="w-3 h-3" /> Evaluation Pending
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-slate-900 leading-none">
                                {round.score}<span className="text-xs text-slate-400 font-bold ml-0.5">/100</span>
                            </span>
                            <div className={`
                                mt-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border
                                ${round.status === 'Passed' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-rose-50 text-rose-700 border-rose-100'}
                            `}>
                                {round.status}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {round.feedback && !isEditing ? (
                <div className="mt-5 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-100 rounded-full"></div>
                    <div className="pl-4">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 leading-none">Internal Feedback</p>
                        <p className="text-sm text-slate-700 italic leading-relaxed font-medium">"{round.feedback}"</p>
                    </div>
                </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end border-t border-slate-50 pt-4">
                {round.status === 'Pending' || isEditing ? (
                    isEditing ? (
                        <form onSubmit={handleSubmitFeedback} className="w-full space-y-4 animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Feedback & Summary</label>
                                <textarea
                                    name="feedback"
                                    defaultValue={round.feedback}
                                    required
                                    placeholder="Detail the candidate's strengths and weaknesses..."
                                    className="w-full text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none p-4 min-h-[100px] font-medium placeholder:font-normal"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Score (0-100)</label>
                                    <input
                                        name="score"
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={round.score}
                                        required
                                        className="w-full text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none px-4 py-3 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Verdict</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStatus('Passed')}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all
                                                ${selectedStatus === 'Passed'
                                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                                        >
                                            Passed
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedStatus('Failed')}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all
                                                ${selectedStatus === 'Failed'
                                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                                        >
                                            Failed
                                        </button>
                                        <input type="hidden" name="status" value={selectedStatus} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Discard</button>
                                <button type="submit" className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-50">Publish Evaluation</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            disabled={isLocked || isFrozen}
                            className={`
                                bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2
                                ${(isLocked || isFrozen) ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'hover:bg-indigo-100'}
                            `}
                            title={isLocked ? "Complete previous rounds first" : isFrozen ? "Candidate process terminated" : ""}
                        >
                            <Star className={`w-3.5 h-3.5 ${(isLocked || isFrozen) ? 'fill-slate-300' : 'fill-indigo-200'}`} />
                            Evaluate Candidate
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        disabled={isFrozen}
                        className={`
                            flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors
                            ${isFrozen ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600'}
                        `}
                        title={isFrozen ? "Cannot modify - Process Terminated" : ""}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Modify
                    </button>
                )}
            </div>
        </div>
    );
};
