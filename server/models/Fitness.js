const mongoose = require('mongoose');

const FitnessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityType: {
        type: String,
        required: [true, 'Please add an activity type'],
        trim: true
    },
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
    },
    activityCategory: {
        type: String,
        enum: ['strength', 'cardio', 'flexibility', 'other'],
        default: 'strength'
    },
    duration: {
        type: Number, // in minutes
    },
    distance: {
        type: Number // in km/miles
    },
    sets: [{
        reps: { type: Number },
        weight: { type: Number },
        completed: { type: Boolean, default: true }
    }],
    repCount: {
        type: Number
    },
    weight: {
        type: Number // in kg
    },
    completed: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fitness', FitnessSchema);
