const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    githubUrl: {
        type: String,
        trim: true,
    },
    linkedinUrl: {
        type: String,
        trim: true,
    },
    skills: [String],
    experience: String,
    education: [{
        institute: String,
        degree: String,
        year: String,
        cgpa: String
    }],
    resumeUrl: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Shortlisted', 'Screening', 'In Progress', 'Selected', 'Offer', 'Onboarding', 'Ready to Join', 'Active', 'Rejected'],
        default: 'Shortlisted'
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    // Dynamic Hiring Pipeline
    rounds: [{
        type: {
            type: String,
            enum: ['Assessment', 'GD', 'Technical', 'Managerial', 'HR'],
            required: true
        },
        name: { type: String, required: true }, // e.g. "Coding Round 1"
        date: { type: Date, default: Date.now },
        interviewer: String, // Name of the evaluator
        feedback: String,
        score: Number, // Normalized 0-100 or 1-10
        status: {
            type: String,
            enum: ['Pending', 'Passed', 'Failed'],
            default: 'Pending'
        }
    }],
    jiraAccountId: {
        type: String,
        trim: true
    },
    internshipStartDate: {
        type: Date
    },
    parsingConfidence: {
        type: Number,
        default: 0,
    },
    parsingStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
    },
    weeklyScores: [{
        week: Number,
        score: Number,
        note: String,
        createdAt: { type: Date, default: Date.now }
    }],
    fullRawText: {
        type: String,
        default: '',
    },
    piiData: {
        address: String,
        idProofUrl: String,
        encryptedPassport: String, // To be implemented in Epic 5
    },
    offerSentAt: { type: Date },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

candidateSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Candidate', candidateSchema);
