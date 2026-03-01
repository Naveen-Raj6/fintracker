import api from '../../../utils/api';

const API_URL = '/habits/';

// Create habit
const addHabit = async (habitData) => {
    const response = await api.post(API_URL, habitData);
    return response.data;
};

// Get habits
const getHabits = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

// Delete habit
const deleteHabit = async (id) => {
    const response = await api.delete(API_URL + id);
    return response.data;
};

// Toggle habit / Log value
const toggleHabit = async (habitId, logData) => {
    const response = await api.put(`${API_URL}${habitId}/toggle`, logData);
    return response.data;
};

const habitService = {
    addHabit,
    getHabits,
    deleteHabit,
    toggleHabit
};

export default habitService;
