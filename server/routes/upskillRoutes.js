const express = require('express');
const router = express.Router();
const { getUpskillProjects, addUpskillProject, addSession, toggleMilestone, deleteProject } = require('../controllers/upskillController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getUpskillProjects)
    .post(protect, addUpskillProject);

router.route('/:id/session')
    .put(protect, addSession);

router.route('/:id/milestone/:milestoneId')
    .put(protect, toggleMilestone);

router.route('/:id')
    .delete(protect, deleteProject);

module.exports = router;
