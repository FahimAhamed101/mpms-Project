import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types based on your backend
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  department?: string;
  skills?: string[];
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  client: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  budget: number;
  thumbnail?: string;
  manager: User | string;
  team: (User | string)[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks?: number;
    progress: number;
  };
}


export interface CreateProjectDto {
  title: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status?: string; // Make it optional and accept any string
  manager: string;
  team?: string[];
  thumbnail?: string;
}

export interface UpdateProjectDto {
  id: string;
  title?: string;
  client?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: string; // Make it optional and accept any string
  manager?: string;
  team?: string[];
  thumbnail?: string;
}

export interface AddTeamMemberDto {
  userId: string;
}

export interface RemoveTeamMemberDto {
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  count: number;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks?: number;
  progress: number;
}

export interface GetProjectsParams {
  status?: string;
  client?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Project', 'ProjectList'],
  endpoints: (builder) => ({
    // Get all projects with optional filters
    getProjects: builder.query<ProjectsResponse, GetProjectsParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params?.status) queryParams.append('status', params.status);
        if (params?.client) queryParams.append('client', params.client);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const queryString = queryParams.toString();
        return `/projects${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Project' as const, id: _id })),
              { type: 'ProjectList', id: 'LIST' },
            ]
          : [{ type: 'ProjectList', id: 'LIST' }],
    }),

    // Get project by ID
    getProjectById: builder.query<ApiResponse<Project>, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    // Create new project
    createProject: builder.mutation<ApiResponse<Project>, CreateProjectDto>({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: [{ type: 'ProjectList', id: 'LIST' }],
    }),

    // Update project
    updateProject: builder.mutation<ApiResponse<Project>, UpdateProjectDto>({
      query: ({ id, ...updateData }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'ProjectList', id: 'LIST' },
      ],
    }),

    // Delete project
    deleteProject: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ProjectList', id: 'LIST' }],
    }),

    // Add team member to project
    addTeamMember: builder.mutation<ApiResponse<Project>, { projectId: string; data: AddTeamMemberDto }>({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/team`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),

    // Remove team member from project
    removeTeamMember: builder.mutation<ApiResponse<Project>, { projectId: string; data: RemoveTeamMemberDto }>({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/team`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
      ],
    }),

    // Get my projects (projects where user is manager or team member)
    getMyProjects: builder.query<ProjectsResponse, GetProjectsParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params?.status) queryParams.append('status', params.status);
        if (params?.client) queryParams.append('client', params.client);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const queryString = queryParams.toString();
        return `/projects/my${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['ProjectList'],
    }),

    // Search projects
    searchProjects: builder.query<ProjectsResponse, { query: string; page?: number; limit?: number }>({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: '/projects',
        params: { search: query, page, limit },
      }),
    }),

    // Get projects by status
    getProjectsByStatus: builder.query<ProjectsResponse, { status: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 }) => ({
        url: '/projects',
        params: { status, page, limit },
      }),
    }),

    // Get projects by client
    getProjectsByClient: builder.query<ProjectsResponse, { client: string; page?: number; limit?: number }>({
      query: ({ client, page = 1, limit = 10 }) => ({
        url: '/projects',
        params: { client, page, limit },
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetMyProjectsQuery,
  useSearchProjectsQuery,
  useGetProjectsByStatusQuery,
  useGetProjectsByClientQuery,
  useLazyGetProjectsQuery,
  useLazySearchProjectsQuery,
  useLazyGetProjectByIdQuery,
} = projectApi;