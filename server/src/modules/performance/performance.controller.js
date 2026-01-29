const PerformanceReview = require('./performance.model');
const Candidate = require('../candidates/candidate.model');
const JiraSnapshot = require('./jira-snapshot.model');

// @desc    Start Internship (Status: Active)
// @route   POST /api/performance/start-internship
// @access  Manager
exports.startInternship = async (req, res) => {
    try {
        const { candidateId, jiraEmail } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        if (candidate.status !== 'Ready to Join') {
            return res.status(400).json({ error: 'Candidate documents must be verified first' });
        }

        candidate.status = 'Active';
        candidate.internshipStartDate = new Date();
        if (jiraEmail) candidate.jiraAccountId = jiraEmail; // Storing email/ID

        await candidate.save();

        // Initialize empty Jira snapshot
        await JiraSnapshot.create({ candidateId: candidate._id });

        res.json({ success: true, message: 'Internship activated', candidate });

    } catch (error) {
        console.error('Start Internship Error:', error);
        res.status(500).json({ error: 'Failed to activate internship' });
    }
};

// @desc    Get Dashboard Stats for Command Center
// @route   GET /api/performance/dashboard
// @access  Manager
exports.getDashboardStats = async (req, res) => {
    try {
        // Get all Active interns
        const interns = await Candidate.find({ status: 'Active' })
            .select('name email status jiraAccountId internshipStartDate')
            .lean();

        // For each intern, fetch their Jira Snapshot & Last Review score
        const stats = await Promise.all(interns.map(async (intern) => {
            const snapshot = await JiraSnapshot.findOne({ candidateId: intern._id });
            const lastReview = await PerformanceReview.findOne({ candidateId: intern._id })
                .sort({ weekNumber: -1 }); // Latest

            return {
                ...intern,
                velocity: snapshot?.activeTickets || 0, // Placeholder mapping
                lastScore: lastReview?.rating?.score || 'N/A',
                trainingProgress: 0 // TODO: Calculate this from Training model
            };
        }));

        res.json({ success: true, interns: stats });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

// @desc    Submit Weekly Review (Manager)
// @route   POST /api/performance/review
// @access  Manager
exports.submitWeeklyReview = async (req, res) => {
    try {
        const { candidateId, score, feedback, internalNotes } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        if (candidate.status !== 'Active' || !candidate.internshipStartDate) {
            return res.status(400).json({ error: 'Internship is not active' });
        }

        // Calculate Week Number
        const start = new Date(candidate.internshipStartDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.ceil(diffDays / 7) || 1; // Default to Week 1 if just started

        // Upsert Review for this week
        const review = await PerformanceReview.findOneAndUpdate(
            { candidateId, weekNumber },
            {
                rating: {
                    score,
                    feedback,
                    internalNotes
                },
                status: 'Submitted',
                startDate: new Date(now.setDate(now.getDate() - now.getDay())), // Start of week (rough approx)
                endDate: new Date()
            },
            { new: true, upsert: true }
        );
        const notificationMessage = `Your performance review for Week ${weekNumber} has been ${review ? 'updated' : 'submitted'}.`;

        const Notification = require('../notifications/notification.model');
        const User = require('../auth/user.model');

        // Find the User associated with this Candidate (by email)
        const user = await User.findOne({ email: candidate.email });

        if (user) {
            await Notification.create({
                recipient: user._id,
                message: notificationMessage,
                type: 'success',
                relatedLink: '/my-performance'
            });
        }

        // Update Candidate's latest score cache (optional, for dashboard speed)
        // We could push to candidate.weeklyScores if we wanted a history there too

        res.json({ success: true, week: weekNumber, review });

    } catch (error) {
        console.error('Submit Review Error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

// @desc    Get review history for a candidate (Manager/Admin)
// @route   GET /api/performance/reviews/:candidateId
// @access  Manager/Admin
exports.getReviewsForCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const reviews = await PerformanceReview.find({ candidateId })
            .sort({ weekNumber: -1 });

        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// @desc    Get my reviews (Intern)
// @route   GET /api/performance/my-reviews
// @access  Intern
exports.getMyReviews = async (req, res) => {
    try {
        console.log('DEBUG: MyReviews Request for:', req.user.email);
        const candidate = await Candidate.findOne({ email: req.user.email });
        console.log('DEBUG: Candidate Found:', candidate ? candidate._id : 'None');

        if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

        const reviews = await PerformanceReview.find({ candidateId: candidate._id })
            .select('-rating.internalNotes') // Exclude private notes
            .sort({ weekNumber: -1 });

        console.log('DEBUG: Reviews found:', reviews.length);

        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        console.error('Get My Reviews Error:', error);
        res.status(500).json({ error: 'Failed to fetch your reviews' });
    }
};

// @desc    Sync Jira Stats (Mock for MVP)
// @route   POST /api/performance/sync-jira/:id
// @access  Manager/Intern
exports.syncJiraStats = async (req, res) => {
    try {
        const { id } = req.params;
        // MOCK: In real implem, call Jira API here using process.env.JIRA_TOKEN

        let snapshot = await JiraSnapshot.findOne({ candidateId: id });
        if (!snapshot) {
            snapshot = new JiraSnapshot({ candidateId: id });
        }

        // Mock updates
        snapshot.totalTickets += 1;
        snapshot.activeTickets = Math.floor(Math.random() * 5);
        snapshot.lastSyncAt = new Date();

        await snapshot.save();

        res.json({ success: true, snapshot });
    } catch (error) {
        console.error('Jira Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync Jira' });
    }
};
