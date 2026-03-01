const mongoose = require('mongoose');

const UpskillSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillName: {
        type: String,
        required: [true, 'Please add a skill name'],
        trim: true
    },
    goalLevel: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'hourly'],
        default: 'daily'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    targetHours: {
        type: Number,
        default: 0
    },
    sessions: [{
        date: {
            type: Date,
            default: Date.now
        },
        duration: {
            type: Number, // in minutes
            required: true
        },
        conceptsLearnt: {
            type: String
        },
        workDone: {
            type: String
        },
        notes: {
            type: String
        }
    }],
    milestones: [{
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
    }],
    totalMinutes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Upskill', UpskillSchema);
