const express = require('express');
const router = express.Router();
const { getHabits, addHabit, toggleHabit, deleteHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getHabits)
    .post(protect, addHabit);

router.route('/:id/toggle')
    .put(protect, toggleHabit);

router.route('/:id')
    .delete(protect, deleteHabit);

module.exports = router;
