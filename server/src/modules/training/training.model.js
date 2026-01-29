const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    resources: [{
        type: {
            type: String,
            enum: ['link', 'file'],
            default: 'link'
        },
        label: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    status: {
        type: String,
        enum: ['Assigned', 'In Progress', 'Completed'],
        default: 'Assigned'
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    completionDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for quick lookup by candidate
trainingSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Training', trainingSchema);
