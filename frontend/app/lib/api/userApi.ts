import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  skills?: string[];
  avatar?: string;
  isActive: boolean;
}

interface GetUsersParams {
  role?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  skills?: string[];
  avatar?: string;
  isActive?: boolean;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
   baseUrl: process.env.NEXT_PUBLIC_API_URL ,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get all users (with optional filters)
    getUsers: builder.query<{ success: boolean; data: User[] }, GetUsersParams>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query<{ success: boolean; data: User }, string>({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),

    // Get current user (profile)
    getCurrentUser: builder.query<{ success: boolean; user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Create user (admin only)
    createUser: builder.mutation<{ success: boolean; data: User }, Partial<User>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation<{ success: boolean; data: User }, UpdateUserData>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Delete user (admin only)
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Update profile (current user)
    updateProfile: builder.mutation<{ success: boolean; user: User }, Partial<User>>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Update password
    updatePassword: builder.mutation<{ success: boolean; message: string }, UpdatePasswordData>({
      query: (body) => ({
        url: '/auth/password',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Toggle user active status (admin only)
    toggleUserStatus: builder.mutation<{ success: boolean; data: User }, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useToggleUserStatusMutation,
} = userApi;