import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fitnessService from '../services/fitnessService';

const initialState = {
    logs: [],
    exercises: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const getFitnessLogs = createAsyncThunk(
    'fitness/getAll',
    async (_, thunkAPI) => {
        try {
            return await fitnessService.getFitnessLogs();
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const addFitnessLog = createAsyncThunk(
    'fitness/add',
    async (logData, thunkAPI) => {
        try {
            return await fitnessService.addFitnessLog(logData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const getExercises = createAsyncThunk(
    'fitness/getExercises',
    async (_, thunkAPI) => {
        try {
            return await fitnessService.getExercises();
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const addExercise = createAsyncThunk(
    'fitness/addExercise',
    async (exerciseData, thunkAPI) => {
        try {
            return await fitnessService.addExercise(exerciseData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const updateExercise = createAsyncThunk(
    'fitness/updateExercise',
    async ({ id, ...exerciseData }, thunkAPI) => {
        try {
            return await fitnessService.updateExercise(id, exerciseData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const deleteExercise = createAsyncThunk(
    'fitness/deleteExercise',
    async (id, thunkAPI) => {
        try {
            return await fitnessService.deleteExercise(id);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const toggleExerciseLog = createAsyncThunk(
    'fitness/toggleExercise',
    async (exerciseId, thunkAPI) => {
        try {
            return await fitnessService.toggleExerciseLog(exerciseId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const deleteFitnessLog = createAsyncThunk(
    'fitness/delete',
    async (id, thunkAPI) => {
        try {
            return await fitnessService.deleteFitnessLog(id);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fitnessSlice = createSlice({
    name: 'fitness',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFitnessLogs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getFitnessLogs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.logs = action.payload;
            })
            .addCase(getFitnessLogs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addFitnessLog.fulfilled, (state, action) => {
                state.logs.unshift(action.payload);
            })
            .addCase(getExercises.fulfilled, (state, action) => {
                state.exercises = action.payload;
            })
            .addCase(addExercise.fulfilled, (state, action) => {
                state.exercises.push(action.payload);
            })
            .addCase(updateExercise.fulfilled, (state, action) => {
                state.exercises = state.exercises.map(ex =>
                    ex._id === action.payload._id ? action.payload : ex
                );
            })
            .addCase(deleteExercise.fulfilled, (state, action) => {
                state.exercises = state.exercises.filter(ex => ex._id !== action.payload.id);
            })
            .addCase(toggleExerciseLog.fulfilled, (state, action) => {
                const index = state.logs.findIndex(l => l._id === action.payload._id);
                if (index !== -1) {
                    state.logs[index] = action.payload;
                } else {
                    state.logs.unshift(action.payload);
                }
            })
            .addCase(deleteFitnessLog.fulfilled, (state, action) => {
                state.logs = state.logs.filter(
                    (log) => log._id !== action.payload.id
                );
            });
    },
});

export const { reset } = fitnessSlice.actions;
export default fitnessSlice.reducer;
