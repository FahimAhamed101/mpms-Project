'use client';

import { api } from './index';

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/reports/dashboard',
      providesTags: ['Report'],
    }),
    getProjectProgress: builder.query({
      query: (projectId: string) => `/reports/project/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Report', id: projectId }],
    }),
    getUserWorkload: builder.query({
      query: (userId: string) => `/reports/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Report', id: userId }],
    }),
    getSprintReports: builder.query({
      query: (sprintId: string) => `/reports/sprint/${sprintId}`,
      providesTags: (result, error, sprintId) => [{ type: 'Report', id: sprintId }],
    }),
    // Advanced reports with filters
    getProjectAnalytics: builder.query({
      query: ({ projectId, startDate, endDate }: {
        projectId: string;
        startDate?: string;
        endDate?: string;
      }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/reports/project/${projectId}/analytics?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),
    getTeamPerformance: builder.query({
      query: ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/reports/team/performance?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetProjectProgressQuery,
  useGetUserWorkloadQuery,
  useGetSprintReportsQuery,
  useGetProjectAnalyticsQuery,
  useGetTeamPerformanceQuery,
} = reportApi;