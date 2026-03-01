const express = require('express');
const router = express.Router();
const {
    getFitnessLogs, addFitnessLog, deleteFitnessLog,
    getExercises, addExercise, updateExercise, deleteExercise,
    toggleExerciseLog
} = require('../controllers/fitnessController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFitnessLogs)
    .post(protect, addFitnessLog);

router.route('/exercises')
    .get(protect, getExercises)
    .post(protect, addExercise);

router.route('/exercises/:id')
    .put(protect, updateExercise)
    .delete(protect, deleteExercise);

router.route('/toggle/:exerciseId')
    .put(protect, toggleExerciseLog);

router.route('/:id')
    .delete(protect, deleteFitnessLog);

module.exports = router;
