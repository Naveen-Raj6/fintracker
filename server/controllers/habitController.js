const Habit = require('../models/Habit');
const asyncHandler = require('../middleware/asyncHandler');
const { calculateStreak } = require('../utils/habitUtils');

// @desc    Get user habits
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
    const habits = await Habit.find({ userId: req.user.id });
    res.status(200).json(habits);
});

// @desc    Create a habit
// @route   POST /api/habits
// @access  Private
const addHabit = asyncHandler(async (req, res) => {
    const { name, frequency, trackingType, unit } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a habit name');
    }

    const habit = await Habit.create({
        userId: req.user.id,
        name,
        frequency: frequency || 'daily',
        daysOfWeek: req.body.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        trackingType: trackingType || 'boolean',
        unit
    });

    res.status(201).json(habit);
});

// @desc    Toggle habit / Log value
// @route   PUT /api/habits/:id/toggle
// @access  Private
const toggleHabit = asyncHandler(async (req, res) => {
    const { value, sequence, duration, completed } = req.body;
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogIndex = habit.logs.findIndex(log => {
        const d = new Date(log.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });

    if (todayLogIndex !== -1) {
        if (habit.trackingType === 'bitwise') {
            habit.logs[todayLogIndex].sequence = sequence;
            habit.logs[todayLogIndex].completed = completed;
        } else if (habit.trackingType === 'duration') {
            habit.logs[todayLogIndex].duration = duration;
            habit.logs[todayLogIndex].completed = completed;
        } else if (habit.trackingType === 'boolean') {
            // Toggle boolean
            habit.logs.splice(todayLogIndex, 1);
        } else {
            habit.logs[todayLogIndex].value = value;
            habit.logs[todayLogIndex].completed = completed;
        }
    } else {
        const newLog = { date: today, value: value || 1, duration, sequence, completed };
        if (habit.trackingType === 'boolean') newLog.completed = true;
        habit.logs.push(newLog);
    }

    // Streak calculation using utility
    habit.streak = calculateStreak(habit.logs.filter(l => l.completed).map(l => l.date));

    // XP Gain Logic
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user) {
        const xpAmount = (completed || habit.trackingType === 'boolean') ? 20 : 5;
        user.xp += xpAmount;
        if (user.xp >= user.level * 100) {
            user.xp -= user.level * 100;
            user.level += 1;
        }
        await user.save();
    }

    await habit.save();
    res.status(200).json(habit);
});

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('Habit not found');
    }

    if (habit.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await habit.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getHabits,
    addHabit,
    toggleHabit,
    deleteHabit
};
