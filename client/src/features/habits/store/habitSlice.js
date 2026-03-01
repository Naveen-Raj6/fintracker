import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import habitService from '../services/habitService';

const initialState = {
    habits: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const getHabits = createAsyncThunk(
    'habits/getAll',
    async (_, thunkAPI) => {
        try {
            return await habitService.getHabits();
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const addHabit = createAsyncThunk(
    'habits/add',
    async (habitData, thunkAPI) => {
        try {
            return await habitService.addHabit(habitData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const toggleHabit = createAsyncThunk(
    'habits/toggle',
    async ({ id, ...logData }, thunkAPI) => {
        try {
            return await habitService.toggleHabit(id, logData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const deleteHabit = createAsyncThunk(
    'habits/delete',
    async (id, thunkAPI) => {
        try {
            return await habitService.deleteHabit(id);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const habitSlice = createSlice({
    name: 'habits',
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
            .addCase(getHabits.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getHabits.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.habits = action.payload;
            })
            .addCase(getHabits.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addHabit.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addHabit.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.habits.push(action.payload);
            })
            .addCase(addHabit.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(toggleHabit.fulfilled, (state, action) => {
                state.habits = state.habits.map((habit) =>
                    habit._id === action.payload._id ? action.payload : habit
                );
            })
            .addCase(deleteHabit.fulfilled, (state, action) => {
                state.habits = state.habits.filter(
                    (habit) => habit._id !== action.payload.id
                );
            });
    },
});

export const { reset } = habitSlice.actions;
export default habitSlice.reducer;
