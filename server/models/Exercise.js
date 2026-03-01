const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add an exercise name'],
        trim: true
    },
    category: {
        type: String,
        enum: ['strength', 'cardio', 'flexibility', 'other'],
        default: 'strength'
    },
    defaultSets: {
        type: Number,
        default: 1
    },
    defaultReps: {
        type: Number
    },
    defaultWeight: {
        type: Number // in kg
    },
    defaultDuration: {
        type: Number // in minutes
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
