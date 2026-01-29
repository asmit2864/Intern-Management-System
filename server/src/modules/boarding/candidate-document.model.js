const mongoose = require('mongoose');

const candidateDocumentSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true,
    },
    // Which type of document is this?
    type: {
        type: String,
        enum: ['offer_letter', 'aadhar', 'pan', 'certificate', 'other'],
        required: true,
    },
    // The filename/path in the secure upload folder
    url: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
    },
    // Verification workflow status
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
    },
    // If rejected, why?
    rejectionReason: {
        type: String,
        default: '',
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    verifiedAt: {
        type: Date,
    },
});

module.exports = mongoose.model('CandidateDocument', candidateDocumentSchema);
