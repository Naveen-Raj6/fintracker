const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a habit name'],
        trim: true
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily'
    },
    daysOfWeek: {
        type: [Number], // 0-6 (Sun-Sat)
        default: [0, 1, 2, 3, 4, 5, 6]
    },
    trackingType: {
        type: String,
        enum: ['boolean', 'duration', 'quantity', 'bitwise'],
        default: 'boolean'
    },
    isRecurring: {
        type: Boolean,
        default: true
    },
    targetDuration: {
        type: Number, // In minutes
        default: 0
    },
    unit: {
        type: String, // 'hours', 'pages', 'matches', etc.
        trim: true
    },
    logs: [{
        date: {
            type: Date,
            default: Date.now
        },
        value: {
            type: Number,
            default: 1
        },
        sequence: {
            type: String // e.g. "W,L,W"
        },
        duration: {
            type: Number // manual duration logged
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    streak: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Habit', HabitSchema);
