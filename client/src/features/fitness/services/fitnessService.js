import api from '../../../utils/api';

const API_URL = '/fitness/';

// Add fitness log
const addFitnessLog = async (logData) => {
    const response = await api.post(API_URL, logData);
    return response.data;
};

// Get fitness logs
const getFitnessLogs = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

// Delete fitness log
const deleteFitnessLog = async (id) => {
    const response = await api.delete(API_URL + id);
    return response.data;
};

// Get exercise registry
const getExercises = async () => {
    const response = await api.get(`${API_URL}exercises`);
    return response.data;
};

// Add exercise template
const addExercise = async (exerciseData) => {
    const response = await api.post(`${API_URL}exercises`, exerciseData);
    return response.data;
};

// Update exercise template
const updateExercise = async (id, exerciseData) => {
    const response = await api.put(`${API_URL}exercises/${id}`, exerciseData);
    return response.data;
};

// Delete exercise template
const deleteExercise = async (id) => {
    const response = await api.delete(`${API_URL}exercises/${id}`);
    return response.data;
};

// Toggle exercise completion for today
const toggleExerciseLog = async (exerciseId) => {
    const response = await api.put(`${API_URL}toggle/${exerciseId}`);
    return response.data;
};

const fitnessService = {
    addFitnessLog,
    getFitnessLogs,
    deleteFitnessLog,
    getExercises,
    addExercise,
    updateExercise,
    deleteExercise,
    toggleExerciseLog
};

export default fitnessService;
