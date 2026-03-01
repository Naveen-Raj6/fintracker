import api from '../../../utils/api';

const API_URL = '/expenses/';

// Get all expenses
const getExpenses = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

// Create new expense
const createExpense = async (expenseData) => {
    const response = await api.post(API_URL, expenseData);
    return response.data;
};

// Update expense
const updateExpense = async (expenseData) => {
    const response = await api.put(API_URL + expenseData.id, expenseData);
    return response.data;
};

// Delete expense
const deleteExpense = async (expenseId) => {
    const response = await api.delete(API_URL + expenseId);
    return response.data;
};

const expenseService = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};

export default expenseService;
