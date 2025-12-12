import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';
import authReducer from '../features/auth/authSlice';
import { teamApi } from './api/teamApi'; 
import { projectApi } from './api/projectApi';
import { taskApi } from './api/taskApi';
import { sprintApi } from './api/sprintApi';
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer, [projectApi.reducerPath]: projectApi.reducer,[taskApi.reducerPath]: taskApi.reducer,[sprintApi.reducerPath]: sprintApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer, 
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(projectApi.middleware).concat(teamApi.middleware).concat(taskApi.middleware).concat(sprintApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;