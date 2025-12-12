// app/lib/api/taskApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { Task, TaskPriority, TaskStatus } from '@/app/types';

interface GetTasksParams {
  project?: string;
  sprint?: string;
  assignee?: string;
  status?: TaskStatus; // This should be TaskStatus (not string)
  priority?: TaskPriority; // This should be TaskPriority (not string)
  search?: string;
}
interface UpdateTaskData {
  id: string;
  status?: TaskStatus;
  assignees?: string[];
  priority?: string;
  dueDate?: string;
}

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<{ success: boolean; data: Task[] }, GetTasksParams>({
      query: (params) => ({
        url: '/tasks',
        params,
      }),
      providesTags: ['Task'],
    }),

    getTaskById: builder.query<{ success: boolean; data: Task }, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: ['Task'],
    }),

    createTask: builder.mutation<{ success: boolean; data: Task }, Partial<Task>>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),

    updateTask: builder.mutation<{ success: boolean; data: Task }, UpdateTaskData>({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Task'],
    }),

    deleteTask: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),

    assignTask: builder.mutation<{ success: boolean; data: Task }, { id: string; assignees: string[] }>({
      query: ({ id, assignees }) => ({
        url: `/tasks/${id}/assign`,
        method: 'POST',
        body: { assignees },
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAssignTaskMutation,
} = taskApi;