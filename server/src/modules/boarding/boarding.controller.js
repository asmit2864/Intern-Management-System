const Candidate = require('../candidates/candidate.model');
const User = require('../auth/user.model');
const CandidateDocument = require('./candidate-document.model');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

/**
 * 1. Enable Onboarding (Manager Action)
 * Create a USER account for the candidate and send the email.
 */
exports.enableOnboarding = async (req, res) => {
    try {
        const { candidateId } = req.body;
        const candidate = await Candidate.findById(candidateId);

        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        if (!candidate.email) {
            return res.status(400).json({ error: 'Candidate has no email' });
        }

        // Check if user already exists
        let user = await User.findOne({ email: candidate.email });

        // Generate temporary password (random 8 chars)
        const tempPassword = Math.random().toString(36).slice(-8);

        if (user) {
            // Idempotency: If user already exists (e.g. clicked twice), just reset password and resend email.
            if (user.role !== 'intern') {
                return res.status(400).json({ error: 'User account exists but is not an intern.' });
            }
            user.password = tempPassword; // Will be hashed by save hook
            await user.save();
            console.log(`Resetting password for existing intern: ${candidate.email}`);
        } else {
            // Create User
            user = await User.create({
                email: candidate.email,
                password: tempPassword, // Will be hashed by pre-save hook
                role: 'intern'
            });
        }

        // Update Candidate Status
        candidate.status = 'Onboarding';
        // Link user ID to candidate if we had a field, but for now email match is enough.
        // Or we can add userId to Candidate model later? 
        // For MVP, we'll look up Candidate by email when Intern logs in.
        await candidate.save();

        // Send Email
        // TODO: Move Nodemailer setup to a shared utility? Using inline for now as per previous patterns.
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.ethereal.email",
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'test',
                pass: process.env.SMTP_PASS || 'test',
            },
        });

        await transporter.sendMail({
            from: '"Wissen HR" <hr@wissen.com>',
            to: candidate.email,
            subject: 'Welcome to Wissen Onboarding',
            text: `Dear ${candidate.name},\n\nYour offer has been accepted! Please log in to the Onboarding Portal to complete your documentation.\n\nURL: http://localhost:5173/login\nEmail: ${candidate.email}\nPassword: ${tempPassword}\n\nPlease upload your documents immediately.\n\nRegards,\nHR Team`
        });

        res.status(200).json({ success: true, message: 'Onboarding enabled and email sent' });

    } catch (error) {
        console.error('Enable Onboarding Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * 2. Get Intern Profile (Intern Action)
 * Fetch my candidate details and document status.
 */
exports.getMyOnboardingStatus = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const email = req.user.email;

        // Find the Candidate record matching this user
        const candidate = await Candidate.findOne({ email });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate profile not found' });
        }

        // Fetch documents
        const documents = await CandidateDocument.find({ candidateId: candidate._id });

        // Self-Healing Logic:
        // If status is 'Ready to Join' but documents are missing/unverified, revert to 'Onboarding'
        if (candidate.status === 'Ready to Join') {
            const requiredTypes = ['offer_letter', 'aadhar', 'pan', 'certificate'];
            const allVerified = requiredTypes.every(type => {
                const d = documents.find(doc => doc.type === type);
                return d && d.status === 'verified';
            });

            if (!allVerified) {
                console.warn(`Data Integrity Fix: Reverting Candidate ${candidate.email} from 'Ready to Join' to 'Onboarding' due to missing docs.`);
                candidate.status = 'Onboarding';
                await candidate.save();
            }
        }

        res.status(200).json({
            success: true,
            candidate: {
                name: candidate.name,
                email: candidate.email,
                joiningDate: candidate.internshipStartDate ? new Date(candidate.internshipStartDate).toLocaleDateString() : 'TBD',
                status: candidate.status,
                id: candidate._id
            },
            documents
        });

    } catch (error) {
        console.error('Onboarding Status Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * 3. Upload Document (Intern Action)
 */
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { type, candidateId } = req.body;
        console.log(`Intern uploading ${type} for Candidate ID: ${candidateId}`);

        // Create Document Record
        // If one already exists for this type, update it (re-upload)
        let doc = await CandidateDocument.findOne({ candidateId, type });

        if (doc) {
            // Unlink old file? For MVP, just overwrite record path
            doc.url = req.file.path;
            doc.originalName = req.file.originalname;
            doc.status = 'pending'; // Reset status on re-upload
            doc.rejectionReason = '';
            doc.uploadedAt = Date.now();
            await doc.save();
        } else {
            doc = await CandidateDocument.create({
                candidateId,
                type,
                url: req.file.path,
                originalName: req.file.originalname,
                status: 'pending'
            });
        }

        res.status(200).json({ success: true, document: doc });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
};

/**
 * 4. Verify Document (Manager Action)
 */
exports.verifyDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { status, reason } = req.body; // status: 'verified' | 'rejected'

        const doc = await CandidateDocument.findById(documentId);
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // 1. Update the document status
        doc.status = status;
        if (status === 'verified') {
            doc.verifiedAt = Date.now();
            doc.rejectionReason = '';
        } else if (status === 'rejected') {
            doc.rejectionReason = reason || 'Document rejected by RH';
        }

        // 2. SAVE the document FIRST. This is the critical fix.
        // We must commit the state to DB before checking aggregate status.
        await doc.save();
        console.log(`Document ${doc.type} saved as ${status} for Candidate ${doc.candidateId}`);

        // 3. If verified, check if ALL other required documents are ALSO verified in the DB
        if (status === 'verified') {
            const requiredTypes = ['offer_letter', 'aadhar', 'pan', 'certificate'];

            // Fetch fresh list from DB
            const allDocs = await CandidateDocument.find({ candidateId: doc.candidateId });

            const allVerified = requiredTypes.every(type => {
                const d = allDocs.find(d => d.type === type);
                return d && d.status === 'verified';
            });

            const missingOrPending = requiredTypes.filter(type => {
                const d = allDocs.find(d => d.type === type);
                return !d || d.status !== 'verified';
            });

            console.log(`Candidate ${doc.candidateId} Status Check: AllVerified=${allVerified}. Missing/Pending: ${missingOrPending.join(', ')}`);

            if (allVerified) {
                const candidate = await Candidate.findById(doc.candidateId);
                // Fix: Do not revert status if already Active
                if (candidate && candidate.status !== 'Ready to Join' && candidate.status !== 'Active') {
                    candidate.status = 'Ready to Join';
                    await candidate.save();
                    console.log(`SUCCESS: Candidate ${candidate.email} transitioned to Ready to Join!`);
                }
            }
        }

        res.status(200).json({ success: true, document: doc });

    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Failed to verify document' });
    }
};

/**
 * 4.5 Get Candidate Documents (Manager Action)
 */
exports.getCandidateDocuments = async (req, res) => {
    try {
        const { candidateId } = req.params;
        console.log(`Manager fetching docs for Candidate ID: ${candidateId}`);
        const documents = await CandidateDocument.find({ candidateId });
        console.log(`Found ${documents.length} docs.`);
        res.status(200).json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

/**
 * 5. Get File Stream (Secure Access)
 */
exports.getDocumentFile = async (req, res) => {
    try {
        const { documentId } = req.params;
        const doc = await CandidateDocument.findById(documentId);

        if (!doc) {
            return res.status(404).json({ error: 'Document record not found' });
        }

        // Security Check: 
        // User must be Admin/Manager OR the owner Intern
        // for now assuming middleware handled role check or we add specific check here

        if (!fs.existsSync(doc.url)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        // Determine content type based on extension
        const ext = path.extname(doc.originalName).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);

        // internal path usage
        res.sendFile(path.resolve(doc.url));

    } catch (error) {
        console.error('File access error:', error);
        res.status(500).json({ error: 'File access error' });
    }
};
