// app/lib/api/teamApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  skills?: string[];
  avatar?: string;
  isActive: boolean;
  stats?: {
    projectCount: number;
    totalTasks: number;
    activeTasks: number;
  };
}

interface GetTeamMembersParams {
  search?: string;
  department?: string;
  role?: string;
  limit?: number;
  page?: number;
}

interface TeamMembersResponse {
  success: boolean;
  count: number;
  data: TeamMember[];
}

export const teamApi = createApi({
  reducerPath: 'teamApi',
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
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    getTeamMembers: builder.query<TeamMembersResponse, GetTeamMembersParams>({
      query: (params) => ({
        url: '/team',
        params,
      }),
      providesTags: ['Team'],
    }),
    
    createTeamMember: builder.mutation<TeamMember, Partial<TeamMember>>({
      query: (body) => ({
        url: '/team',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Team'],
    }),
    
    updateTeamMember: builder.mutation<TeamMember, { id: string; data: Partial<TeamMember> }>({
      query: ({ id, data }) => ({
        url: `/team/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    
    deleteTeamMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/team/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamApi;