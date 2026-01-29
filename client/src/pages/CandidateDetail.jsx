import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Star, Download, ExternalLink, Briefcase, GraduationCap, Edit, Github, Linkedin, Send, XCircle, Bot, Rocket, FileText, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import CandidateResolverModal from '../features/candidates/CandidateResolverModal';
import RejectionModal from '../features/candidates/RejectionModal';
import OfferModal from '../features/offers/OfferModal';
import CandidateChat from '../features/candidates/CandidateChat';
import api from '../lib/api';
import { toast } from 'sonner';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import OnboardingTab from '../features/candidates/OnboardingTab';
import InternshipActionsTab from '../features/candidates/InternshipActionsTab';
import { HiringTimeline } from '../components/hiring/HiringTimeline';
import { Lock } from 'lucide-react';

const CandidateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'resume' | 'onboarding' | 'joining'



    const fetchCandidate = async () => {
        try {
            const response = await api.get(`/candidates/${id}`);
            setCandidate(response.data.candidate);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Could not load candidate details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidate();
    }, [id, navigate]);

    const handleRejectCandidate = async (reason) => {
        try {
            const res = await api.patch(`/candidates/${id}`, {
                status: 'Rejected',
                rejectionReason: reason
            });
            setCandidate(res.data.candidate);
            setIsRejectOpen(false);
            toast.success('Candidate marked as Rejected');
        } catch (error) {
            toast.error('Failed to reject candidate');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    if (!candidate) return null;

    const resumeUrl = candidate.resumeUrl ? `${import.meta.env.VITE_BASE_API_URL}${candidate.resumeUrl}` : null;

    const handleStatusUpdate = async (newStatus) => {
        try {
            await api.patch(`/candidates/${id}`, { status: newStatus });
            setCandidate(prev => ({ ...prev, status: newStatus }));
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleProfileUpdate = async (updatedData) => {
        try {
            const response = await api.patch(`/candidates/${id}`, updatedData);
            setCandidate(response.data.candidate);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
            {/* Header */}
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">{candidate.name}</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                Added on {new Date(candidate.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-2 px-2.5" onClick={() => setIsEditOpen(true)} title="Edit Profile">
                            <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                            variant={candidate.status === 'Selected' ? 'default' : 'secondary'}
                            size="sm"
                            className={`ml-2 gap-2 shadow-sm font-semibold border-0 ${candidate.status === 'Selected' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            disabled={candidate.status !== 'Selected'}
                            onClick={() => setIsOfferOpen(true)}
                            title={['Offer', 'Onboarding', 'Ready to Join', 'Active'].includes(candidate.status) ? "Offer already sent" : candidate.status !== 'Selected' ? "Complete the hiring pipeline first" : "Send Offer Letter"}
                        >
                            {['Offer', 'Onboarding', 'Ready to Join', 'Active'].includes(candidate.status) ? <Mail className="w-4 h-4" /> : candidate.status === 'Rejected' ? <XCircle className="w-4 h-4" /> : candidate.status !== 'Selected' ? <Lock className="w-3 h-3" /> : <Send className="w-4 h-4" />}
                            {['Offer', 'Onboarding', 'Ready to Join', 'Active'].includes(candidate.status) ? 'Offer Sent' : candidate.status === 'Rejected' ? 'Rejected' : 'Send Offer'}
                        </Button>

                        {!['Active', 'Rejected'].includes(candidate.status) && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200"
                                onClick={() => setIsRejectOpen(true)}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Read-Only Status Display (Styled like a select but static) */}
                    <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 font-medium shadow-sm">
                        <span className="text-slate-400 mr-2 text-xs uppercase tracking-wider font-semibold">Stage:</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${['Active', 'Selected', 'Offer', 'Onboarding', 'Ready to Join'].includes(candidate.status) ? 'bg-emerald-500' :
                                candidate.status === 'Rejected' ? 'bg-rose-500' :
                                    'bg-blue-500'
                                }`} />
                            {candidate.status}
                        </div>
                    </div>

                    {/* Rejection Reason Display */}
                    {candidate.status === 'Rejected' && candidate.rejectionReason && (
                        <div className="hidden md:flex items-center bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 text-sm text-rose-800 font-medium shadow-sm ml-2">
                            <span className="text-rose-400 mr-2 text-xs uppercase tracking-wider font-semibold">Reason:</span>
                            {candidate.rejectionReason}
                        </div>
                    )}
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm border-0 font-semibold"
                        onClick={() => setIsChatOpen(true)}
                    >
                        <Bot className="w-4 h-4 mr-2" />
                        Ask AI
                    </Button>
                </div>
            </header>

            {/* Main Content - Split View */}
            <main className="flex flex-1 overflow-hidden">
                {/* Left Panel - Info */}
                <div className="w-1/3 shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8">

                    {/* Contact */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            Contact Info
                        </h3>
                        <div className="space-y-3">
                            {/* Phone */}
                            <a
                                href={candidate.phone ? `tel:${candidate.phone}` : '#'}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${candidate.phone ? 'bg-white border-slate-200 hover:border-teal-500 hover:shadow-sm group' : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60'}`}
                            >
                                <div className={`p-2 rounded-full ${candidate.phone ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-100' : 'bg-slate-100 text-slate-400'}`}>
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500 font-medium">Phone</div>
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {candidate.phone || 'Not Available'}
                                    </div>
                                </div>
                                {candidate.phone && <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />}
                            </a>

                            {/* Email */}
                            <a
                                href={candidate.email ? `mailto:${candidate.email}` : '#'}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${candidate.email ? 'bg-white border-slate-200 hover:border-teal-500 hover:shadow-sm group' : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60'}`}
                            >
                                <div className={`p-2 rounded-full ${candidate.email ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-100' : 'bg-slate-100 text-slate-400'}`}>
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500 font-medium">Email</div>
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {candidate.email || 'Not Available'}
                                    </div>
                                </div>
                                {candidate.email && <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />}
                            </a>

                            {/* LinkedIn */}
                            <a
                                href={candidate.linkedinUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${candidate.linkedinUrl ? 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-sm group' : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60'}`}
                            >
                                <div className={`p-2 rounded-full ${candidate.linkedinUrl ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                                    <Linkedin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500 font-medium">LinkedIn</div>
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {candidate.linkedinUrl ? candidate.linkedinUrl.replace('https://www.', '').replace('https://', '') : 'Not Available'}
                                    </div>
                                </div>
                                {candidate.linkedinUrl && <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />}
                            </a>

                            {/* GitHub */}
                            <a
                                href={candidate.githubUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${candidate.githubUrl ? 'bg-white border-slate-200 hover:border-slate-800 hover:shadow-sm group' : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60'}`}
                            >
                                <div className={`p-2 rounded-full ${candidate.githubUrl ? 'bg-slate-100 text-slate-700 group-hover:bg-slate-200' : 'bg-slate-100 text-slate-400'}`}>
                                    <Github className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-500 font-medium">GitHub</div>
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {candidate.githubUrl ? candidate.githubUrl.replace('https://github.com/', '@') : 'Not Available'}
                                    </div>
                                </div>
                                {candidate.githubUrl && <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />}
                            </a>
                        </div>
                    </section>

                    {/* Education */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            Education
                        </h3>
                        <div className="space-y-3">
                            {candidate.education && candidate.education.length > 0 ? (
                                candidate.education.map((edu, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 text-sm">
                                                    {edu.degree || 'Degree Not Specified'}
                                                </h4>
                                                <p className="text-sm text-slate-500">{edu.institute || 'Institute Not Specified'}</p>
                                            </div>
                                            {edu.year && (
                                                <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-slate-200 text-slate-600">
                                                    {edu.year}
                                                </span>
                                            )}
                                        </div>
                                        {edu.cgpa && (
                                            <div className="mt-2 text-xs font-medium text-teal-600 flex items-center gap-1">
                                                <span>{String(edu.cgpa).includes('%') ? 'Percentage' : 'CGPA'}: {edu.cgpa}</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No education details available.</p>
                            )}
                        </div>
                    </section>

                    {/* Skills */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Star className="w-4 h-4 text-slate-400" />
                                Skills
                            </h3>
                            {candidate.parsingConfidence && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${candidate.parsingConfidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {Math.round(candidate.parsingConfidence * 100)}% Match
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills && candidate.skills.length > 0 ? (
                                candidate.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors cursor-default">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No skills extracted.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Panel - Tabs: Resume | Onboarding */}
                <div className="flex-1 bg-slate-100 flex flex-col h-full">
                    {/* Tab Header with State Guards */}
                    <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-6 text-sm font-medium shrink-0">
                        <button
                            onClick={() => setActiveTab('pipeline')}
                            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pipeline' ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Clock className="w-4 h-4" />
                            Hiring Status
                        </button>
                        <button
                            onClick={() => setActiveTab('resume')}
                            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'resume' ? 'border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Resume
                        </button>

                        {/* Guarded Onboarding Tab */}
                        <div className="relative group">
                            <button
                                onClick={() => setActiveTab('onboarding')}
                                disabled={candidate.status !== 'Offer' && candidate.status !== 'Onboarding' && candidate.status !== 'Ready to Join' && candidate.status !== 'Active'}
                                className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'onboarding' ? 'border-indigo-500 text-indigo-700' :
                                    (candidate.status !== 'Offer' && candidate.status !== 'Onboarding' && candidate.status !== 'Ready to Join' && candidate.status !== 'Active') ? 'border-transparent text-slate-300 cursor-not-allowed' : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {(candidate.status !== 'Offer' && candidate.status !== 'Onboarding' && candidate.status !== 'Ready to Join' && candidate.status !== 'Active') && <Lock className="w-3 h-3" />}
                                <GraduationCap className="w-4 h-4" />
                                Onboarding & Documents
                            </button>
                            {/* Tooltip */}
                            {(candidate.status !== 'Offer' && candidate.status !== 'Onboarding' && candidate.status !== 'Ready to Join' && candidate.status !== 'Active') && (
                                <div className="absolute top-full left-0 z-50 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg mt-1">
                                    Offer must be accepted to unlock Onboarding.
                                </div>
                            )}
                        </div>

                        {/* Guarded Internship Tab */}
                        <div className="relative group">
                            <button
                                onClick={() => setActiveTab('joining')}
                                disabled={candidate.status !== 'Ready to Join' && candidate.status !== 'Active'}
                                className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'joining' ? 'border-emerald-500 text-emerald-700' :
                                    (candidate.status !== 'Ready to Join' && candidate.status !== 'Active') ? 'border-transparent text-slate-300 cursor-not-allowed' : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {(candidate.status !== 'Ready to Join' && candidate.status !== 'Active') && <Lock className="w-3 h-3" />}
                                <Rocket className="w-4 h-4" />
                                Internship Status
                            </button>
                            {(candidate.status !== 'Ready to Join' && candidate.status !== 'Active') && (
                                <div className="absolute top-full left-0 z-50 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg mt-1">
                                    Complete Onboarding to unlock Internship actions.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Tab Content */}
                    <div className={`flex-1 ${activeTab === 'pipeline' ? 'p-0' : 'p-4'} h-full overflow-hidden overflow-y-auto`}>
                        {activeTab === 'pipeline' ? (
                            <div className="h-full overflow-auto">
                                {/* Hiring Pipeline Component */}
                                <HiringTimeline
                                    candidate={candidate}
                                    onUpdate={setCandidate}
                                />
                            </div>
                        ) : activeTab === 'resume' ? (
                            <div className="h-full flex flex-col">
                                {/* Resume Preview */}
                                <div className="mb-2 flex justify-between items-center text-xs text-slate-500">
                                    <span>Original Resume: {candidate.originalName || 'resume.pdf'}</span>
                                    {resumeUrl && (
                                        <div className="flex gap-2">
                                            <a href={resumeUrl} download className="flex items-center gap-1 hover:text-teal-600">
                                                <Download className="w-3 h-3" /> Download
                                            </a>
                                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-teal-600">
                                                <ExternalLink className="w-3 h-3" /> Open New Tab
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {resumeUrl ? (
                                    <iframe
                                        src={resumeUrl}
                                        className="w-full h-full rounded-lg shadow-sm border border-slate-200 bg-white"
                                        title="Resume PDF"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
                                        <FileText className="w-8 h-8 opacity-50" />
                                        <p>No resume file available</p>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'onboarding' ? (
                            <div className="h-full">
                                <OnboardingTab
                                    candidate={candidate}
                                    onUpdate={() => setCandidate(prev => ({ ...prev, status: 'Onboarding' }))}
                                />
                            </div>
                        ) : (
                            <div className="h-full">
                                <InternshipActionsTab
                                    candidate={candidate}
                                    onUpdate={() => setCandidate(prev => ({ ...prev, status: 'Active' }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main >

            <CandidateResolverModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                initialData={candidate}
                title="Edit Candidate Profile"
                onSave={handleProfileUpdate}
            />

            <OfferModal
                isOpen={isOfferOpen}
                onClose={() => setIsOfferOpen(false)}
                candidate={candidate}
                onOfferSent={() => handleStatusUpdate('Offer')}
            />

            <CandidateChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                candidateId={id}
                candidateName={candidate.name}
                messages={chatMessages}
                onSuccess={fetchCandidate}
            />

            <RejectionModal
                isOpen={isRejectOpen}
                onClose={() => setIsRejectOpen(false)}
                onConfirm={handleRejectCandidate}
                candidateName={candidate?.name}
                isLoading={loading}
            />
        </div >
    );
};

export default CandidateDetail;
