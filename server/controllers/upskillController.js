const Upskill = require('../models/Upskill');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get upskill projects
// @route   GET /api/upskill
// @access  Private
const getUpskillProjects = asyncHandler(async (req, res) => {
    const projects = await Upskill.find({ userId: req.user.id });
    res.status(200).json(projects);
});

// @desc    Add upskill project
// @route   POST /api/upskill
// @access  Private
const addUpskillProject = asyncHandler(async (req, res) => {
    const { skillName, targetHours, startDate, endDate, milestones, goalLevel } = req.body;

    if (!skillName) {
        res.status(400);
        throw new Error('Please add a skill name');
    }

    const project = await Upskill.create({
        userId: req.user.id,
        skillName,
        goalLevel: goalLevel || 'daily',
        targetHours: targetHours || 0,
        startDate,
        endDate,
        milestones: milestones || []
    });

    res.status(201).json(project);
});

// @desc    Add session to upskill project
// @route   PUT /api/upskill/:id/session
// @access  Private
const addSession = asyncHandler(async (req, res) => {
    const { duration, notes, date, conceptsLearnt, workDone } = req.body;

    const project = await Upskill.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    if (!duration) {
        res.status(400);
        throw new Error('Please add duration');
    }

    const newSession = {
        duration,
        notes,
        date: date || Date.now(),
        conceptsLearnt,
        workDone
    };

    project.sessions.push(newSession);
    project.totalMinutes += parseInt(duration);

    // XP Gain Logic
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user) {
        user.xp += 30;
        if (user.xp >= user.level * 100) {
            user.xp -= user.level * 100;
            user.level += 1;
        }
        await user.save();
    }

    await project.save();
    res.status(200).json(project);
});

// @desc    Toggle milestone completion
// @route   PUT /api/upskill/:id/milestone/:milestoneId
// @access  Private
const toggleMilestone = asyncHandler(async (req, res) => {
    const project = await Upskill.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    milestone.completed = !milestone.completed;

    // Bonus XP for completing a milestone
    if (milestone.completed) {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user) {
            user.xp += 50;
            if (user.xp >= user.level * 100) {
                user.xp -= user.level * 100;
                user.level += 1;
            }
            await user.save();
        }
    }

    await project.save();
    res.status(200).json(project);
});

// @desc    Delete upskill project
// @route   DELETE /api/upskill/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Upskill.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await project.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getUpskillProjects,
    addUpskillProject,
    addSession,
    toggleMilestone,
    deleteProject
};
