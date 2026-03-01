import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import upskillService from '../services/upskillService';

const initialState = {
    projects: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

export const getUpskillProjects = createAsyncThunk(
    'upskill/getAll',
    async (_, thunkAPI) => {
        try {
            return await upskillService.getUpskillProjects();
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const addUpskillProject = createAsyncThunk(
    'upskill/add',
    async (projectData, thunkAPI) => {
        try {
            return await upskillService.addUpskillProject(projectData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const addSession = createAsyncThunk(
    'upskill/addSession',
    async (data, thunkAPI) => {
        try {
            return await upskillService.addSession(data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const deleteProject = createAsyncThunk(
    'upskill/delete',
    async (id, thunkAPI) => {
        try {
            return await upskillService.deleteProject(id);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const toggleMilestone = createAsyncThunk(
    'upskill/toggleMilestone',
    async (data, thunkAPI) => {
        try {
            return await upskillService.toggleMilestone(data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const upskillSlice = createSlice({
    name: 'upskill',
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
            .addCase(getUpskillProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUpskillProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload;
            })
            .addCase(getUpskillProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addUpskillProject.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addUpskillProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects.push(action.payload);
            })
            .addCase(addUpskillProject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addSession.fulfilled, (state, action) => {
                state.projects = state.projects.map((project) =>
                    project._id === action.payload._id ? action.payload : project
                );
            })
            .addCase(toggleMilestone.fulfilled, (state, action) => {
                state.projects = state.projects.map((project) =>
                    project._id === action.payload._id ? action.payload : project
                );
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.projects = state.projects.filter(
                    (project) => project._id !== action.payload.id
                );
            });
    },
});

export const { reset } = upskillSlice.actions;
export default upskillSlice.reducer;
