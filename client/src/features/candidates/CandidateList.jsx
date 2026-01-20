import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MoreHorizontal, Mail, Phone, Calendar, Search, Filter, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import DeleteConfirmModal from './DeleteConfirmModal';

const STATUS_TABS = [
    { id: 'all', label: 'All Candidates' },
    { id: 'Assessment', label: 'Assessment' },
    { id: 'Interview', label: 'Interview' },
    { id: 'Offer', label: 'Offer' },
    { id: 'Hired', label: 'Hired' },
    { id: 'Rejected', label: 'Rejected' },
];

const CandidateList = ({ refreshTrigger, onDeleteSuccess }) => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [search, setSearch] = useState('');

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        candidateId: null,
        candidateName: '',
        isLoading: false
    });

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const filterRef = useRef(null);
    const [colleges, setColleges] = useState([]);

    // UI State (what user is typing/selecting)
    const [tempFilters, setTempFilters] = useState({
        minCgpa: '',
        dateRange: 'all',
        college: 'all'
    });

    // API State (what is actually applied)
    const [appliedFilters, setAppliedFilters] = useState({
        minCgpa: '',
        dateRange: 'all',
        college: 'all'
    });

    useEffect(() => {
        // Fetch colleges on mount
        const loadColleges = async () => {
            try {
                const res = await api.get('/candidates/filters/colleges');
                setColleges(res.data.data || []);
            } catch (err) {
                console.error('Failed to load colleges', err);
            }
        };
        loadColleges();
    }, []);

    // Handle Click Outside to Close Filters
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10,
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(search && { search }),
                ...(appliedFilters.minCgpa && { minCgpa: appliedFilters.minCgpa }),
                ...(appliedFilters.college !== 'all' && { college: appliedFilters.college }),
                ...(appliedFilters.dateRange !== 'all' && { dateRange: appliedFilters.dateRange })
            };

            const response = await api.get('/candidates', { params });
            setCandidates(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCandidates();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, statusFilter, refreshTrigger, search, appliedFilters]); // Depend on appliedFilters

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setPage(1); // Reset to first page
    };

    const handleFilterChange = (key, value) => {
        setTempFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(tempFilters);
        setPage(1);
        setShowFilters(false);
    };

    const clearFilters = () => {
        const resetState = {
            minCgpa: '',
            dateRange: 'all',
            college: 'all'
        };
        setTempFilters(resetState);
        setAppliedFilters(resetState);
        setPage(1);
    };

    const handleDeleteClick = (e, id, name) => {
        e.stopPropagation();
        setDeleteModal({
            isOpen: true,
            candidateId: id,
            candidateName: name,
            isLoading: false
        });
    };

    const handleConfirmDelete = async () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            await api.delete(`/candidates/${deleteModal.candidateId}`);
            toast.success('Candidate deleted successfully');
            setDeleteModal({ isOpen: false, candidateId: null, candidateName: '', isLoading: false });
            fetchCandidates(); // Refresh local list
            if (onDeleteSuccess) onDeleteSuccess(); // Notify parent to refresh stats
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete candidate');
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Helper to generate last 12 months for filter
    const getLast12Months = () => {
        const months = [];
        const date = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'long' });
            const year = d.getFullYear();
            const value = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({ value, label: `${monthName} ${year}` });
        }
        return months;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative">
            {/* Header & Filters */}
            <div className="p-6 border-b border-slate-100 space-y-4 rounded-t-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Candidates</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 w-64"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        <div className="relative" ref={filterRef}>
                            <Button
                                variant={showFilters ? "default" : "outline"}
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </Button>

                            {/* Filter Dropdown */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-12 z-50 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-slate-900">Filters</h3>
                                            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-900">
                                                Clear All
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* CGPA Filter */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-slate-700">Min CGPA</label>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 8.0"
                                                    step="0.1"
                                                    value={tempFilters.minCgpa}
                                                    onChange={(e) => handleFilterChange('minCgpa', e.target.value)}
                                                />
                                            </div>



                                            {/* Date Filter */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-slate-700">Applied Month</label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    value={tempFilters.dateRange}
                                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                                >
                                                    <option value="all">All Time</option>
                                                    {getLast12Months().map((month) => (
                                                        <option key={month.value} value={month.value}>
                                                            {month.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* College Filter */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-slate-700">College / Institute</label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    value={tempFilters.college}
                                                    onChange={(e) => handleFilterChange('college', e.target.value)}
                                                >
                                                    <option value="all">All Colleges</option>
                                                    {colleges.map((col, idx) => (
                                                        <option key={idx} value={col}>{col.substring(0, 30)}{col.length > 30 ? '...' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <Button
                                                className="w-full mt-4"
                                                onClick={applyFilters}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleStatusChange(tab.id)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${statusFilter === tab.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="p-12 flex justify-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Candidate</th>
                                    <th className="px-6 py-4">Applied</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Education</th>
                                    <th className="px-6 py-4">CGPA</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {candidates.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            No candidates found in this stage.
                                        </td>
                                    </tr>
                                ) : (
                                    candidates.map((candidate) => (
                                        <motion.tr
                                            key={candidate._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{candidate.name}</div>
                                                        <div className="text-slate-500 text-xs flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {candidate.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDate(candidate.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${candidate.status === 'Assessment' ? 'bg-purple-50 text-purple-700' :
                                                        candidate.status === 'Interview' ? 'bg-blue-50 text-blue-700' :
                                                            candidate.status === 'Hired' ? 'bg-green-50 text-green-700' :
                                                                candidate.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                                                                    'bg-slate-100 text-slate-700'}
                                                `}>
                                                    {candidate.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {candidate.education && candidate.education.length > 0 ? (
                                                    <div className="text-sm text-slate-700">
                                                        <div className="font-medium">{candidate.education[0].degree}</div>
                                                        <div className="text-xs text-slate-500">{candidate.education[0].institute}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-700">
                                                    {candidate.education && candidate.education.length > 0 && candidate.education[0].cgpa
                                                        ? candidate.education[0].cgpa
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300"
                                                        onClick={() => navigate(`/candidates/${candidate._id}`)}
                                                    >
                                                        Review
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={(e) => handleDeleteClick(e, candidate._id, candidate.name)}
                                                        title="Delete Candidate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View (Story 3.3) */}
                    <div className="md:hidden space-y-4 p-4">
                        {candidates.map((candidate) => (
                            <div key={candidate._id} className="bg-white border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                            {candidate.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{candidate.name}</div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                                                {candidate.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-500 space-y-1">
                                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {candidate.email}</div>
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(candidate.createdAt)}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate(`/candidates/${candidate._id}`)}
                                    >
                                        Review
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="px-3 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200"
                                        onClick={(e) => handleDeleteClick(e, candidate._id, candidate.name)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                            <span className="text-sm text-slate-500">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmDelete}
                candidateName={deleteModal.candidateName}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
};

export default CandidateList;
