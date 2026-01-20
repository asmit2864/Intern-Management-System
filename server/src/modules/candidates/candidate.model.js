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
        enum: ['Assessment', 'Interview', 'Offer', 'Hired', 'Rejected'],
        default: 'Assessment',
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
