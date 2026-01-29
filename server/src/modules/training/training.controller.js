const Training = require('./training.model');
const Candidate = require('../candidates/candidate.model');
const User = require('../auth/user.model');
const Notification = require('../notifications/notification.model');

// @desc    Assign training to multiple candidates
// @route   POST /api/training/assign
// @access  Manager
exports.bulkAssign = async (req, res) => {
    try {
        const { candidateIds, title, description, resources, dueDate } = req.body;

        if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
            return res.status(400).json({ error: 'Please select at least one candidate' });
        }

        const trainingDocs = candidateIds.map(id => ({
            title,
            description,
            resources,
            dueDate,
            assignedTo: id,
            assignedBy: req.user._id,
            status: 'Assigned',
            assignedDate: new Date()
        }));

        await Training.insertMany(trainingDocs);

        // Notify Interns
        // We need to find User IDs for these candidates to send notifications
        const Candidate = require('../candidates/candidate.model');
        const notifications = [];

        for (const candidateId of candidateIds) {
            const candidate = await Candidate.findById(candidateId);
            if (candidate && candidate.email) {
                const user = await User.findOne({ email: candidate.email });
                if (user) {
                    notifications.push({
                        recipient: user._id,
                        title: 'New Training Assigned',
                        message: `You have been assigned a new training module: "${title}". Due date: ${new Date(dueDate).toLocaleDateString()}`,
                        type: 'info'
                    });
                }
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json({
            success: true,
            message: `Assigned training "${title}" to ${candidateIds.length} interns`
        });

    } catch (error) {
        console.error('Bulk Assign Error:', error);
        res.status(500).json({ error: 'Failed to assign training' });
    }
};

// @desc    Get my assigned trainings (Intern)
// @route   GET /api/training/my-learning
// @access  Intern (via Candidate ID)
exports.getMyTraining = async (req, res) => {
    try {
        // Find candidate linked to this user email
        const candidate = await Candidate.findOne({ email: req.user.email });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate profile not found' });
        }

        const trainings = await Training.find({ assignedTo: candidate._id })
            .sort({ dueDate: 1, createdAt: -1 });

        res.json({ success: true, count: trainings.length, trainings });
    } catch (error) {
        console.error('Get My Training Error:', error);
        res.status(500).json({ error: 'Failed to fetch trainings' });
    }
};

// @desc    Mark training as complete
// @route   PATCH /api/training/:id/complete
// @access  Intern
exports.markComplete = async (req, res) => {
    try {
        const training = await Training.findById(req.params.id);

        if (!training) {
            return res.status(404).json({ error: 'Training module not found' });
        }

        // Verify ownership (optional but recommended)
        const candidate = await Candidate.findOne({ email: req.user.email });
        if (!candidate || training.assignedTo.toString() !== candidate._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        training.status = 'Completed';
        training.completionDate = new Date();
        await training.save();

        res.json({ success: true, training });
    } catch (error) {
        console.error('Mark Complete Error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// @desc    Get all trainings (Manager Dashboard)
// @route   GET /api/training/all
// @access  Manager
exports.getAllTrainings = async (req, res) => {
    try {
        // Aggregate training progress per candidate
        // This is complex, for MVP let's just fetch all and verify on frontend or basic list
        // Or fetch for a specific candidate?
        // Let's return a flat list for now or support filtering

        const trainings = await Training.find()
            .populate('assignedTo', 'name email status') // Get candidate details
            .sort({ createdAt: -1 });

        res.json({ success: true, trainings });
    } catch (error) {
        console.error('Get All Trainings Error:', error);
        res.status(500).json({ error: 'Failed to fetch all trainings' });
    }
};
// @desc    Get trainings for a specific candidate (Manager)
// @route   GET /api/training/candidate/:candidateId
// @access  Manager
exports.getTrainingByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const trainings = await Training.find({ assignedTo: candidateId })
            .sort({ dueDate: 1, createdAt: -1 });

        res.json({ success: true, count: trainings.length, trainings });
    } catch (error) {
        console.error('Get Training By Candidate Error:', error);
        res.status(500).json({ error: 'Failed to fetch candidate trainings' });
    }
};
// @desc    Upload resource file (PDF)
// @route   POST /api/training/upload-resource
// @access  Manager
exports.uploadResource = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the relative path for frontend to use as URL
        // req.file.path is absolute, we need relative to server root or public URL
        // Assuming we serve 'uploads' statically or use an API to fetch
        // For local dev, let's return the full path relative to the uploads mount

        // We generally want to store something like 'uploads/filename.pdf'
        // And then serve it via express.static('uploads')

        const relativePath = `uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: relativePath,
            filename: req.file.originalname
        });

    } catch (error) {
        console.error('Upload Resource Error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

// @desc    Delete training and notify intern
// @route   DELETE /api/training/:id
// @access  Manager
exports.deleteTraining = async (req, res) => {
    try {
        const training = await Training.findById(req.params.id);

        if (!training) {
            return res.status(404).json({ error: 'Training module not found' });
        }

        // Create notification for the assignee before deleting
        // We need to find the User ID corresponding to the Candidate ID (assignedTo)
        // Note: assignedTo in Training is a Candidate ID. Notification needs a User ID (recipient).
        // Let's find the candidate first to get the email, then find the user.

        const candidate = await Candidate.findById(training.assignedTo);
        console.log('DEBUG: Delete Training - Found Candidate:', candidate ? candidate._id : 'None');

        if (candidate) {
            const user = await User.findOne({ email: candidate.email });
            console.log('DEBUG: Delete Training - Found Linked User:', user ? user._id : 'None');

            if (user) {
                const notif = await Notification.create({
                    recipient: user._id,
                    message: `The training module "${training.title}" has been deleted by the manager.`,
                    type: 'warning'
                });
                console.log('DEBUG: Notification Created:', notif._id);
            } else {
                console.log('DEBUG: No user found for candidate email:', candidate.email);
            }
        } else {
            console.log('DEBUG: No candidate found for ID:', training.assignedTo);
        }

        await training.deleteOne();

        res.json({ success: true, message: 'Training module removed' });

    } catch (error) {
        console.error('Delete Training Error:', error);
        res.status(500).json({ error: 'Failed to delete training' });
    }
};
