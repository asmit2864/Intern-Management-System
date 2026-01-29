import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, LayoutDashboard, Database, RefreshCw, X, Plus, Calendar, Search, Star, UserCog } from 'lucide-react';
import { toast } from 'sonner';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const dateInputRef = useRef(null);

    // Training Assignment State
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedInterns, setSelectedInterns] = useState([]);
    const [trainingForm, setTrainingForm] = useState({
        title: '',
        description: '',
        resources: [],
        dueDate: ''
    });
    const [newResource, setNewResource] = useState({ type: 'link', label: '', url: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInterns = stats.filter(intern =>
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatResourceUrl = (res) => {
        if (res.type === 'file') {
            // Ensure we use the API base URL (removing /api if needed, or just relative to root)
            // Ideally should be absolute URL from env in a real app
            // For now, assuming localhost:5000 is where uploads are
            return `http://localhost:5000/${res.url}`;
        }
        if (res.type === 'link') {
            return res.url.startsWith('http') ? res.url : `https://${res.url}`;
        }
        return res.url;
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/performance/dashboard');
            if (data.success) {
                setStats(data.interns);
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSyncJira = async (id) => {
        try {
            await api.post(`/performance/sync-jira/${id}`);
            fetchStats(); // Refresh data
            toast.success('Jira metrics synced successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            toast.error('Failed to sync Jira metrics');
        }
    };

    // Training Handlers
    const toggleInternSelection = (id) => {
        setSelectedInterns(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const visibleIds = filteredInterns.map(i => i._id);
        const allVisibleSelected = visibleIds.every(id => selectedInterns.includes(id));

        if (allVisibleSelected) {
            // Deselect all visible
            setSelectedInterns(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            // Select all visible (preserving already selected ones that are hidden)
            const newSelection = new Set([...selectedInterns, ...visibleIds]);
            setSelectedInterns(Array.from(newSelection));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/training/upload-resource', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                setNewResource(prev => ({
                    ...prev,
                    url: data.url,
                    label: prev.label || data.filename // Auto-fill label if empty
                }));
                toast.success('File uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleAssignTrainingSubmit = async (e) => {
        e.preventDefault();
        if (selectedInterns.length === 0) {
            toast.error('Please select at least one intern');
            return;
        }

        setAssignLoading(true);
        try {
            const { data } = await api.post('/training/assign', {
                candidateIds: selectedInterns,
                ...trainingForm
            });
            if (data.success) {
                toast.success(`Assigned "${trainingForm.title}" to ${selectedInterns.length} interns`);
                setIsAssigning(false);
                setTrainingForm({ title: '', description: '', resources: [], dueDate: '' });
                setSelectedInterns([]);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to assign training');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-[1600px] mx-auto">
                <header className="flex justify-between items-center mb-8 pb-8 border-b">
                    <div className="flex items-center gap-4">
                        <UserCog className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-indigo-600 font-sans tracking-tight">
                            Intern Manager
                        </h1>
                        {/* Navigation Links */}

                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">
                            Logged in as <span className="font-semibold text-slate-900">{user?.email}</span>
                        </span>
                        <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900">
                                <Database className="w-4 h-4 mr-2" />
                                Recruitment Hub
                            </Button>
                            <Button variant="ghost" size="sm" className="bg-indigo-50 text-indigo-700 shadow-sm">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Intern Manager
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </header>

                <main>
                    {/* Command Center Grid */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-semibold text-slate-800">Active Cohort ({stats.length})</h2>
                            <div className="flex gap-2">
                                <Button onClick={() => setIsAssigning(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Assign Training
                                </Button>
                                <Button variant="outline" size="sm" onClick={fetchStats}>
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh Metrics
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Intern</th>
                                        <th className="px-6 py-4">Start Date</th>
                                        <th className="px-6 py-4">Phase</th>
                                        <th className="px-6 py-4">Velocity (Goal: 20 pts)</th>
                                        <th className="px-6 py-4">Last Review</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading metrics...</td></tr>
                                    ) : stats.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-400">No active interns yet. Start an internship from the Candidate Dashboard.</td></tr>
                                    ) : (
                                        stats.map((intern) => (
                                            <tr
                                                key={intern._id}
                                                onClick={() => navigate(`/tracking/${intern._id}`)}
                                                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{intern.name}</div>
                                                    <div className="text-xs text-slate-500">{intern.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {intern.internshipStartDate ? new Date(intern.internshipStartDate).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        Active Project
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min((intern.velocity / 20) * 100, 100)}%` }} // Assuming 20 is a good target
                                                            />
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-sm">{intern.velocity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {intern.lastScore !== 'N/A' ? (
                                                        <div className={`flex items-center gap-1 font-bold ${intern.lastScore >= 4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            <Star className="w-4 h-4 fill-current" />
                                                            {intern.lastScore}/5
                                                        </div>
                                                    ) : <span className="text-slate-400">Pending</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleSyncJira(intern._id); }}>
                                                        Sync Jira
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* Assign Training Modal */}
                {isAssigning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b">
                                <h3 className="text-lg font-bold text-slate-900">Assign Training Module</h3>
                                <button onClick={() => setIsAssigning(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAssignTrainingSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Module Title</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="e.g. React Patterns & Best Practices"
                                                value={trainingForm.title}
                                                onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                            <div className="relative group">
                                                <input
                                                    ref={dateInputRef}
                                                    required
                                                    type="date"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 ${!trainingForm.dueDate ? 'text-slate-400' : 'text-slate-900'
                                                        }`}
                                                    value={trainingForm.dueDate}
                                                    onChange={e => setTrainingForm({ ...trainingForm, dueDate: e.target.value })}
                                                    onClick={() => dateInputRef.current.showPicker()}
                                                />
                                                <Calendar
                                                    className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors cursor-pointer p-0"
                                                    onClick={() => dateInputRef.current.showPicker()}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                        <textarea
                                            required
                                            rows="3"
                                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                            placeholder="What should the intern learn?"
                                            value={trainingForm.description}
                                            onChange={e => setTrainingForm({ ...trainingForm, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Resources</label>

                                        {/* Resource List */}
                                        <div className="space-y-2 mb-3">
                                            {trainingForm.resources.map((res, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded border">
                                                    <span className="text-xs font-bold uppercase text-slate-500 w-12">{res.type}</span>
                                                    <a href={formatResourceUrl(res)} target="_blank" className="text-sm text-indigo-600 truncate flex-1 hover:underline">
                                                        {res.label}
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newRes = [...trainingForm.resources];
                                                            newRes.splice(idx, 1);
                                                            setTrainingForm({ ...trainingForm, resources: newRes });
                                                        }}
                                                        className="text-slate-400 hover:text-red-500"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {trainingForm.resources.length === 0 && (
                                                <p className="text-sm text-slate-400 italic">No resources added yet.</p>
                                            )}
                                        </div>

                                        {/* Add Resource Inputs */}
                                        <div className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border border-dashed border-slate-300">
                                            <div className="w-24">
                                                <label className="text-xs text-slate-500 block mb-1">Type</label>
                                                <select
                                                    className="w-full p-2 text-sm border rounded outline-none"
                                                    value={newResource.type}
                                                    onChange={e => setNewResource({ type: e.target.value, label: '', url: '' })}
                                                >
                                                    <option value="link">Link</option>
                                                    <option value="file">File (PDF)</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-500 block mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Documentation"
                                                    className="w-full p-2 text-sm border rounded outline-none"
                                                    value={newResource.label}
                                                    onChange={e => setNewResource({ ...newResource, label: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex-[2]">
                                                <label className="text-xs text-slate-500 block mb-1">
                                                    {newResource.type === 'file' ? 'File (PDF)' : 'URL'}
                                                </label>

                                                {newResource.type === 'file' ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            accept="application/pdf"
                                                            className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                            onChange={handleFileUpload}
                                                            disabled={uploading}
                                                        />
                                                        {uploading && <span className="text-xs text-indigo-600 animate-pulse whitespace-nowrap">Uploading...</span>}
                                                        {newResource.url && !uploading && <span className="text-xs text-emerald-600 font-medium whitespace-nowrap flex items-center gap-1">Uploaded <span className="text-lg">✓</span></span>}
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder="https://..."
                                                        className="w-full p-2 text-sm border rounded outline-none"
                                                        value={newResource.url}
                                                        onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                                    />
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={!newResource.label || !newResource.url || uploading}
                                                onClick={() => {
                                                    setTrainingForm({
                                                        ...trainingForm,
                                                        resources: [...trainingForm.resources, newResource]
                                                    });
                                                    setNewResource({ type: 'link', label: '', url: '' });
                                                }}
                                                className="bg-slate-800 text-white"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-slate-700">Assign To</label>
                                        <button type="button" onClick={handleSelectAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                            {filteredInterns.length > 0 && filteredInterns.every(i => selectedInterns.includes(i._id)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search interns by name..."
                                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                                        {filteredInterns.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-500">No interns found</div>
                                        ) : (
                                            filteredInterns.map(intern => (
                                                <label key={intern._id} className="flex items-center p-3 hover:bg-slate-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                        checked={selectedInterns.includes(intern._id)}
                                                        onChange={() => toggleInternSelection(intern._id)}
                                                    />
                                                    <span className="ml-3 text-sm text-slate-700">{intern.name}</span>
                                                    <span className="ml-auto text-xs text-slate-400">{intern.email}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    {selectedInterns.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Selected {selectedInterns.length} candidate(s)
                                        </p>
                                    )}
                                </div>
                            </form>

                            <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setIsAssigning(false)}>Cancel</Button>
                                <Button
                                    onClick={handleAssignTrainingSubmit}
                                    disabled={assignLoading || selectedInterns.length === 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {assignLoading ? 'Assigning...' : 'Assign Training'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackingDashboard;
