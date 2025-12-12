// app/lib/api/sprintApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { Sprint } from '@/app/types';

interface GetSprintsParams {
  projectId?: string;
  search?: string;
}

interface CreateSprintData {
  title: string;
  project: string;
  startDate: string;
  endDate: string;
  goal?: string;
}

export const sprintApi = createApi({
  reducerPath: 'sprintApi',
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
  tagTypes: ['Sprint'],
  endpoints: (builder) => ({
    getSprints: builder.query<{ success: boolean; data: Sprint[] }, GetSprintsParams>({
      query: (params) => ({
        url: '/sprints',
        params,
      }),
      providesTags: ['Sprint'],
    }),

    getSprintById: builder.query<{ success: boolean; data: Sprint }, string>({
      query: (id) => `/sprints/${id}`,
      providesTags: ['Sprint'],
    }),

    createSprint: builder.mutation<{ success: boolean; data: Sprint }, CreateSprintData>({
      query: (body) => ({
        url: '/sprints',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sprint'],
    }),

    updateSprint: builder.mutation<{ success: boolean; data: Sprint }, { id: string; data: Partial<Sprint> }>({
      query: ({ id, data }) => ({
        url: `/sprints/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Sprint'],
    }),

    deleteSprint: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/sprints/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sprint'],
    }),

    getSprintTasks: builder.query<{ success: boolean; data: any[] }, string>({
      query: (id) => `/sprints/${id}/tasks`,
      providesTags: ['Sprint'],
    }),
  }),
});

export const {
  useGetSprintsQuery,
  useGetSprintByIdQuery,
  useCreateSprintMutation,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
  useGetSprintTasksQuery,
} = sprintApi;