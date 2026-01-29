const mongoose = require('mongoose');

// Schema to store a cached version of Jira tickets
const jiraSnapshotSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true,
        unique: true
    },
    lastSyncAt: {
        type: Date,
        default: Date.now
    },
    totalTickets: { type: Number, default: 0 },
    activeTickets: { type: Number, default: 0 },
    completedTickets: { type: Number, default: 0 },

    // Detailed list for the Intern Portal UI
    tickets: [{
        key: String, // "PROJ-123"
        summary: String,
        status: String,
        storyPoints: Number,
        priority: String,
        created: Date,
        updated: Date,
        resolutionDate: Date,
        link: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('JiraSnapshot', jiraSnapshotSchema);
