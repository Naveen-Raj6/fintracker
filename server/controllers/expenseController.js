const Expense = require('../models/Expense');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
});

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
const addExpense = asyncHandler(async (req, res) => {
    const { title, amount, category, date, description, type } = req.body;

    if (!title || !amount || !category) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const expense = await Expense.create({
        userId: req.user.id,
        title,
        amount,
        category,
        date: date || Date.now(),
        description,
        type: type || 'expense'
    });

    res.status(201).json(expense);
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const { title, amount, category, description, type } = req.body;

    const updateData = {
        title,
        amount,
        category,
        description,
        type,
        updatedAt: Date.now()
    };

    const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    );

    res.status(200).json(updatedExpense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Get Global Stats (Admin)
// @route   GET /api/expenses/stats
// @access  Private/Admin
const getGlobalStats = asyncHandler(async (req, res) => {
    // Total expenses across all users
    const totalExpenses = await Expense.aggregate([
        {
            $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    // Aggregate by category
    const categoryStats = await Expense.aggregate([
        {
            $group: {
                _id: "$category",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        total: totalExpenses[0] ? totalExpenses[0].totalAmount : 0,
        count: totalExpenses[0] ? totalExpenses[0].count : 0,
        byCategory: categoryStats
    });
});

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getGlobalStats
};
