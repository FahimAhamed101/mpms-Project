'use client';

import { api } from './index';

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/reports/dashboard',
      providesTags: ['Report'],
    }),
 

    getSprintReports: builder.query({
      query: (sprintId: string) => `/reports/sprint/${sprintId}`,
      providesTags: (result, error, sprintId) => [{ type: 'Report', id: sprintId }],
    }),

     getProjectProgress: builder.query({
      query: (projectId: string) => `/reports/project/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Report', id: projectId }],
    }),
    
    // User workload report
    getUserWorkload: builder.query({
      query: (userId: string) => `/reports/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Report', id: userId }],
    }),
    
    // Team performance report
    getTeamPerformance: builder.query({
      query: ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/reports/team/performance?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),
    
    // Project analytics with filters
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
    
    // Time tracking report
    getTimeTrackingReport: builder.query({
      query: ({ startDate, endDate, userId }: {
        startDate: string;
        endDate: string;
        userId?: string;
      }) => {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        if (userId) params.append('userId', userId);
        return `/reports/time-tracking?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),
    
    // Budget report
    getBudgetReport: builder.query({
      query: ({ projectId }: { projectId?: string } = {}) => {
        const params = new URLSearchParams();
        if (projectId) params.append('projectId', projectId);
        return `/reports/budget?${params.toString()}`;
      },
      providesTags: ['Report'],
    }),
    
    // Export report
    exportReport: builder.mutation({
      query: ({ format, type, filters }: {
        format: 'pdf' | 'excel' | 'csv';
        type: string;
        filters: Record<string, any>;
      }) => ({
        url: `/reports/export`,
        method: 'POST',
        body: { format, type, filters },
      }),
    }),
  }),
});



export const {
  useGetDashboardStatsQuery,
  useGetProjectProgressQuery,
  useGetUserWorkloadQuery,
  useGetTeamPerformanceQuery,
  useGetProjectAnalyticsQuery,
  useGetTimeTrackingReportQuery,
  useGetBudgetReportQuery,
  useExportReportMutation,
} = reportApi;