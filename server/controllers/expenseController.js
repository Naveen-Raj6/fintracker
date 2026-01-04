const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    const { title, amount, category, date, description } = req.body;

    try {
        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const expense = await Expense.create({
            userId: req.user.id,
            title,
            amount,
            category,
            date: date || Date.now(),
            description
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the expense user
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Restrict updates to allowed fields (prevent date update)
        const { title, amount, category, description } = req.body;

        // Add updatedAt timestamp
        const updateData = {
            title,
            amount,
            category,
            description,
            updatedAt: Date.now()
        };

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the expense user
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Global Stats (Admin)
// @route   GET /api/expenses/stats
// @access  Private/Admin
const getGlobalStats = async (req, res) => {
    try {
        // Aggregate total expenses across all users
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getGlobalStats
};
