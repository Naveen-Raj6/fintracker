import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import expenseReducer from '../features/expenses/store/expenseSlice';
import habitReducer from '../features/habits/store/habitSlice';
import fitnessReducer from '../features/fitness/store/fitnessSlice';
import upskillReducer from '../features/upskill/store/upskillSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        expenses: expenseReducer,
        habits: habitReducer,
        fitness: fitnessReducer,
        upskill: upskillReducer,
    },
});
