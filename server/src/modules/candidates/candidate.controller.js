const Candidate = require('./candidate.model');
const parserService = require('./parser.service');
const path = require('path');

/**
 * Story 2.1: Resume Upload Endpoint
 * POST /api/candidates/upload
 */
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a PDF resume' });
        }

        const filePath = req.file.path;
        const fileName = req.file.filename;

        // Parse resume but DO NOT save to DB yet
        const parseResult = await parserService.parseResume(filePath);

        if (!parseResult.success) {
            // Even if parsing fails, we return the error so the UI can show it
            return res.status(400).json({
                error: parseResult.error || 'Failed to process resume',
                file: fileName
            });
        }

        const { name, email, skills, phone, experience, education, confidence, linkedinUrl, githubUrl, rawText } = parseResult.data;

        // Return staged data for frontend review
        res.status(200).json({
            message: 'Resume parsed successfully',
            candidate: {
                tempId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                resumeUrl: `/uploads/${fileName}`,
                originalName: req.file.originalname,
                name: name || 'Unknown Candidate',
                email: email || '',
                phone: phone || '',
                linkedinUrl: linkedinUrl || '',
                githubUrl: githubUrl || '',
                skills: skills || [],
                experience: experience || '',
                education: education || '',
                fullRawText: rawText || '',
                parsingConfidence: confidence,
                parsingStatus: 'success',
                status: 'Assessment'
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

/**
 * Story 2.6: Batch Create Candidates (From Staging)
 */
exports.createCandidates = async (req, res) => {
    try {
        const { candidates } = req.body;

        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            return res.status(400).json({ error: 'No candidates provided' });
        }

        // Clean data before insert
        const cleanCandidates = candidates.map(c => ({
            name: c.name,
            email: c.email,
            phone: c.phone,
            linkedinUrl: c.linkedinUrl,
            githubUrl: c.githubUrl,
            skills: c.skills,
            experience: c.experience,
            education: c.education,
            resumeUrl: c.resumeUrl,
            fullRawText: c.fullRawText || '',
            parsingStatus: 'success',
            parsingConfidence: c.parsingConfidence || 1.0,
            status: c.status || 'Assessment'
        }));

        const result = await Candidate.insertMany(cleanCandidates);

        res.status(201).json({
            message: `Successfully created ${result.length} candidates`,
            count: result.length,
            ids: result.map(c => c._id)
        });

    } catch (error) {
        console.error('Batch create error:', error);
        res.status(500).json({ error: 'Failed to create candidates' });
    }
};

/**
 * Story 3.1: Candidate List API
 */
exports.getCandidates = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10, minCgpa, college, dateRange } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by College (Institute) - checks any education entry
        if (college && college !== 'all') {
            query['education.institute'] = { $regex: college, $options: 'i' };
        }

        // Filter by Date Range (Specific Month)
        if (dateRange && dateRange !== 'all') {
            const [year, month] = dateRange.split('-').map(Number);
            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59, 999);
                query.createdAt = { $gte: startDate, $lte: endDate };
            }
        }

        // Filter by Min CGPA (checking 1st education entry)
        if (minCgpa) {
            query.$expr = {
                $gte: [{ $toDouble: { $arrayElemAt: ["$education.cgpa", 0] } }, parseFloat(minCgpa)]
            };
        }

        const skip = (page - 1) * limit;

        const candidates = await Candidate.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const total = await Candidate.countDocuments(query);

        res.status(200).json({
            success: true,
            count: candidates.length,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            },
            data: candidates
        });
    } catch (error) {
        console.error('Filter error:', error);
        res.status(500).json({ error: 'Server error fetching candidates' });
    }
};

/**
 * Filter Helper: Get Unique Colleges
 */
exports.getUniqueColleges = async (req, res) => {
    try {
        const colleges = await Candidate.distinct('education.institute');
        // Filter out nulls, empties, and common school keywords to show likely Universities/Colleges
        const schoolKeywords = ['school', 'vidyalaya', 'academy', 'matriculation', 'secondary', 'high'];

        const cleanColleges = colleges
            .filter(c => c && !schoolKeywords.some(kw => c.toLowerCase().includes(kw)))
            .sort();

        res.status(200).json({ success: true, data: cleanColleges });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching colleges' });
    }
};

/**
 * GET /api/candidates/:id
 */
exports.getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json({ success: true, candidate });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching candidate' });
    }
};

/**
 * Story 3.5: Edit Candidate Profile / Story 2.5: Manual Resolver
 * PATCH /api/candidates/:id
 */
exports.updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        res.status(200).json({ success: true, candidate });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating candidate' });
    }
};

/**
 * Dashboard Stats API
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await Candidate.aggregate([
            {
                $group: {
                    _id: null,
                    totalCandidates: { $sum: 1 },
                    assessment: {
                        $sum: { $cond: [{ $eq: ["$status", "Assessment"] }, 1, 0] }
                    },
                    interview: {
                        $sum: { $cond: [{ $eq: ["$status", "Interview"] }, 1, 0] }
                    },
                    offer: {
                        $sum: { $cond: [{ $eq: ["$status", "Offer"] }, 1, 0] }
                    },
                    hired: {
                        $sum: { $cond: [{ $eq: ["$status", "Hired"] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] }
                    }
                }
            }
        ]);

        const data = stats.length > 0 ? stats[0] : {
            totalCandidates: 0,
            assessment: 0,
            interview: 0,
            offer: 0,
            hired: 0,
            rejected: 0
        };

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
};
/**
 * Story 6.1: AI Chat Endpoint
 * POST /api/candidates/:id/chat
 */
exports.handleCandidateChat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const candidateId = req.params.id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        const aiService = require('../../services/ai.service');

        // Use fullRawText from DB as context
        const response = await aiService.getChatResponse(history, candidate.fullRawText || '', message);

        res.status(200).json({
            success: true,
            response
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message || 'Failed to get response from AI' });
    }
};

/**
 * DELETE /api/candidates/:id
 */
exports.deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.status(200).json({ success: true, message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting candidate' });
    }
};
