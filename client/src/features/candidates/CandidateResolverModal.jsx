import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CandidateResolverModal = ({ initialData, isOpen, onClose, onSave, title = "Resolve Candidate Info" }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        skills: ''
    });

    // Education state separate for easier handling of array
    const [educationList, setEducationList] = useState([]);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                linkedinUrl: initialData.linkedinUrl || '',
                githubUrl: initialData.githubUrl || '',
                skills: initialData.skills ? (Array.isArray(initialData.skills) ? initialData.skills.join(', ') : initialData.skills) : ''
            });

            // Initialize education: Ensure it's an array
            if (Array.isArray(initialData.education)) {
                setEducationList(initialData.education);
            } else if (initialData.education && typeof initialData.education === 'string') {
                // If legacy string, maybe try to wrap it? Or just discard.
                // For now, empty array if not structured.
                setEducationList([]);
            } else {
                setEducationList([]);
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Education handlers
    const addEducation = () => {
        setEducationList([...educationList, { institute: '', degree: '', year: '', cgpa: '' }]);
    };

    const removeEducation = (index) => {
        const newList = [...educationList];
        newList.splice(index, 1);
        setEducationList(newList);
    };

    const updateEducation = (index, field, value) => {
        const newList = [...educationList];
        newList[index] = { ...newList[index], [field]: value };
        setEducationList(newList);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate education?
        // At least one entry? No, optional.

        onSave({
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
            education: educationList
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Manually fix or add details that the parser missed.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">LinkedIn URL</label>
                            <Input
                                name="linkedinUrl"
                                value={formData.linkedinUrl || ''}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">GitHub URL</label>
                            <Input
                                name="githubUrl"
                                value={formData.githubUrl || ''}
                                onChange={handleChange}
                                placeholder="https://github.com/username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Skills (comma separated)</label>
                            <Input
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="React, Node.js, ..."
                            />
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-slate-700">Education History</label>
                            <Button type="button" size="sm" variant="outline" onClick={addEducation}>
                                <Plus className="w-3 h-3 mr-1" /> Add Education
                            </Button>
                        </div>

                        <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            {educationList.length === 0 && (
                                <p className="text-sm text-slate-500 italic text-center py-2">No education details added.</p>
                            )}

                            {educationList.length > 0 && (
                                <div className="grid grid-cols-[1fr,1fr,80px,80px,auto] gap-2 px-1 mb-2">
                                    <label className="text-xs font-semibold text-slate-500">Institute</label>
                                    <label className="text-xs font-semibold text-slate-500">Degree</label>
                                    <label className="text-xs font-semibold text-slate-500">Year</label>
                                    <label className="text-xs font-semibold text-slate-500">CGPA/%</label>
                                    <span></span>
                                </div>
                            )}

                            {educationList.map((edu, index) => (
                                <div key={index} className="grid grid-cols-[1fr,1fr,80px,80px,auto] gap-2 items-start animate-fadeIn">
                                    <Input
                                        placeholder="Institute / College"
                                        value={edu.institute}
                                        onChange={(e) => updateEducation(index, 'institute', e.target.value)}
                                        className="bg-white"
                                    />
                                    <Input
                                        placeholder="Degree (e.g. B.Tech)"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                        className="bg-white"
                                    />
                                    <Input
                                        placeholder="Year"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                        className="bg-white"
                                    />
                                    <Input
                                        placeholder="CGPA / %"
                                        value={edu.cgpa}
                                        onChange={(e) => updateEducation(index, 'cgpa', e.target.value)}
                                        className="bg-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => removeEducation(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save & Resolve
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CandidateResolverModal;
