import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  credentials: 'include',
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Handle authentication errors
    if (result.error?.status === 401) {
      // You could dispatch a logout action here
      console.warn('Authentication error - token may be expired');
    }
    
    // Handle server errors
    if (result.error?.status === 500) {
      console.error('Server error:', result.error);
    }
    
    return result;
  },
  tagTypes: ['Auth', 'Project', 'Sprint', 'Task', 'Team', 'Report'],
  endpoints: () => ({}),
});