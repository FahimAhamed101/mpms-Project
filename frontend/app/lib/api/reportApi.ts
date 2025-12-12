// app/lib/api/reportApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: fetchBaseQuery({
     baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/reports`,
 
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Report', 'Dashboard', 'ProjectAnalytics', 'TeamPerformance'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<any, void>({
      query: () => ({
        url: '/dashboard',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
      transformResponse: (response: any) => {
        return {
          success: response?.success || false,
          data: response?.data || {
            overview: {
              totalProjects: 0,
              activeProjects: 0,
              totalTasks: 0,
              totalUsers: 0,
              totalSprints: 0,
            },
            taskStatus: {
              todo: 0,
              inProgress: 0,
              review: 0,
              done: 0,
              overdue: 0,
            },
            recentActivities: [],
          },
          count: response?.count || 0,
        };
      },
    }),
    
    getProjectAnalytics: builder.query<any, string | undefined>({
      query: (projectId) => ({
        url: projectId && projectId !== 'all' ? `/project/${projectId}` : '/projects/analytics',
        method: 'GET',
      }),
      providesTags: (result, error, projectId) => [
        { type: 'ProjectAnalytics', id: projectId || 'all' }
      ],
      transformResponse: (response: any) => {
        return {
          success: response?.success || false,
          data: response?.data || (Array.isArray(response?.data) ? [] : {}),
          count: response?.count || 0,
        };
      },
    }),
    
    getUserWorkload: builder.query<any, string | undefined>({
      query: (userId) => ({
        url: userId && userId !== 'all' ? `/user/${userId}/workload` : '/team/workload',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return {
          success: response?.success || false,
          data: response?.data || (Array.isArray(response?.data) ? [] : {}),
          count: response?.count || 0,
        };
      },
    }),
    
    getTeamPerformance: builder.query<any, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: '/team-performance',
        method: 'GET',
        params: { startDate, endDate },
      }),
      providesTags: ['TeamPerformance'],
      transformResponse: (response: any) => {
        return {
          success: response?.success || false,
          data: response?.data || [],
          count: response?.count || 0,
        };
      },
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetProjectAnalyticsQuery,
  useGetUserWorkloadQuery,
  useGetTeamPerformanceQuery,
} = reportApi;