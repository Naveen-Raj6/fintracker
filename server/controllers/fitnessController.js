const Fitness = require('../models/Fitness');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get fitness logs
// @route   GET /api/fitness
// @access  Private
const getFitnessLogs = asyncHandler(async (req, res) => {
    const logs = await Fitness.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(logs);
});

// @desc    Add fitness log (Manual)
// @route   POST /api/fitness
// @access  Private
const addFitnessLog = asyncHandler(async (req, res) => {
    const { activityType, activityCategory, duration, date, notes, sets, distance } = req.body;

    if (!activityType) {
        res.status(400);
        throw new Error('Please add activity type');
    }

    const log = await Fitness.create({
        userId: req.user.id,
        activityType,
        activityCategory: activityCategory || 'other',
        duration,
        distance,
        sets: sets || [],
        date: date || Date.now(),
        notes,
        completed: true // Manual entries are usually completed
    });

    const user = await User.findById(req.user.id);
    if (user) {
        user.xp += 50;
        if (user.xp >= user.level * 100) {
            user.xp -= user.level * 100;
            user.level += 1;
        }
        await user.save();
    }

    res.status(201).json(log);
});

// @desc    Get exercise registry
// @route   GET /api/fitness/exercises
// @access  Private
const getExercises = asyncHandler(async (req, res) => {
    const exercises = await Exercise.find({ userId: req.user.id });
    res.status(200).json(exercises);
});

// @desc    Add exercise template
// @route   POST /api/fitness/exercises
// @access  Private
const addExercise = asyncHandler(async (req, res) => {
    const exercise = await Exercise.create({
        ...req.body,
        userId: req.user.id
    });
    res.status(201).json(exercise);
});

// @desc    Update exercise template
// @route   PUT /api/fitness/exercises/:id
// @access  Private
const updateExercise = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true }
    );
    res.status(200).json(exercise);
});

// @desc    Delete exercise template
// @route   DELETE /api/fitness/exercises/:id
// @access  Private
const deleteExercise = asyncHandler(async (req, res) => {
    await Exercise.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ id: req.params.id });
});

// @desc    Toggle exercise completion for today
// @route   PUT /api/fitness/toggle/:exerciseId
// @access  Private
const toggleExerciseLog = asyncHandler(async (req, res) => {
    const exercise = await Exercise.findById(req.params.exerciseId);
    if (!exercise) {
        res.status(404);
        throw new Error('Exercise template not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's log for this exercise
    let log = await Fitness.findOne({
        userId: req.user.id,
        exerciseId: req.params.exerciseId,
        date: { $gte: today }
    });

    if (log) {
        log.completed = !log.completed;
    } else {
        log = new Fitness({
            userId: req.user.id,
            exerciseId: req.params.exerciseId,
            activityType: exercise.name,
            activityCategory: exercise.category,
            sets: exercise.defaultSets ? [{ reps: exercise.defaultReps, weight: exercise.defaultWeight }] : [],
            duration: exercise.defaultDuration,
            completed: true,
            date: new Date()
        });
    }

    // XP Gain Logic
    const user = await User.findById(req.user.id);
    if (user && log.completed) {
        user.xp += 30;
        if (user.xp >= user.level * 100) {
            user.xp -= user.level * 100;
            user.level += 1;
        }
        await user.save();
    }

    await log.save();
    res.status(200).json(log);
});

// @desc    Delete fitness log
// @route   DELETE /api/fitness/:id
// @access  Private
const deleteFitnessLog = asyncHandler(async (req, res) => {
    const log = await Fitness.findById(req.params.id);
    if (!log || log.userId.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Log not found or not authorized');
    }
    await log.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getFitnessLogs,
    addFitnessLog,
    deleteFitnessLog,
    getExercises,
    addExercise,
    updateExercise,
    deleteExercise,
    toggleExerciseLog
};
