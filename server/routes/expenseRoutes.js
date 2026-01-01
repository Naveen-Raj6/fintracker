const express = require('express');
const router = express.Router();
const {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getGlobalStats
} = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, addExpense);
router.route('/:id').put(protect, updateExpense).delete(protect, deleteExpense);
router.route('/stats').get(protect, admin, getGlobalStats);

module.exports = router;
