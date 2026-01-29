const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    weekNumber: {
        type: Number,
        required: true
    },
    startDate: Date,
    endDate: Date,

    // Auto-calculated Metrics from Jira
    jiraMetrics: {
        velocity: { type: Number, default: 0 }, // Story Points completed
        ticketsClosed: { type: Number, default: 0 },
        bugRate: { type: Number, default: 0 }, // Percentage
        cycleTime: { type: Number, default: 0 }, // Avg days
        focusFactor: { type: Number, default: 0 } // Completion rate
    },

    // Manager's Qualitative Rating
    rating: {
        score: { type: Number, min: 1, max: 5 },
        feedback: String, // Visible to intern
        internalNotes: String // Private
    },

    status: {
        type: String,
        enum: ['Pending', 'Submitted'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate reviews per week per candidate
performanceSchema.index({ candidateId: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('PerformanceReview', performanceSchema);
