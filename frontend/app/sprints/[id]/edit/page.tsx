'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { 
  useGetSprintByIdQuery,
  useUpdateSprintMutation 
} from '@/app/lib/api/sprintApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import {
  ArrowLeft,
  Save,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';

// Define a type for the sprint data
interface SprintData {
  _id: string;
  title: string;
  project?: any; // Use 'any' to avoid type issues
  startDate: string;
  endDate: string;
  goal?: string;
  sprintNumber: number;
  progress?: number;
  stats?: {
    totalTasks?: number;
    completedTasks?: number;
  };
}

export default function EditSprintPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const sprintId = params.id as string;

  const { data: sprintData, isLoading: sprintLoading } = useGetSprintByIdQuery(sprintId);
  const { data: projectsData } = useGetProjectsQuery();
  const [updateSprint, { isLoading: isUpdating }] = useUpdateSprintMutation();

  const [formData, setFormData] = useState({
    title: '',
    project: '',
    startDate: '',
    endDate: '',
    goal: '',
    sprintNumber: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when sprint data is loaded
  useEffect(() => {
    if (sprintData?.data) {
      const sprint = sprintData.data as SprintData;
      console.log('Sprint data loaded:', sprint);
      
      // FIX: Handle project field safely
      let projectValue = '';
      
      // Check if project exists and handle different formats
      if (sprint.project) {
        if (typeof sprint.project === 'object' && sprint.project !== null) {
          // It's an object - try to get _id or id
          projectValue = (sprint.project as any)._id || (sprint.project as any).id || '';
        } else if (typeof sprint.project === 'string') {
          // It's already a string ID
          projectValue = sprint.project;
        }
      }
      
      setFormData({
        title: sprint.title || '',
        project: projectValue,
        startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
        endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
        goal: sprint.goal || '',
        sprintNumber: sprint.sprintNumber || 0,
      });
    }
  }, [sprintData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.project) newErrors.project = 'Project is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
      
      const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (duration < 1) {
        newErrors.endDate = 'Sprint must be at least 1 day';
      }
      if (duration > 30) {
        newErrors.endDate = 'Sprint duration should not exceed 30 days';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    try {
      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        project: formData.project,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        sprintNumber: formData.sprintNumber,
        goal: formData.goal.trim() || '',
      };
      
      console.log('Submitting update data:', updateData);
      
      await updateSprint({ id: sprintId, ...updateData }).unwrap();
      router.push(`/sprints/${sprintId}`);
    } catch (error: any) {
      console.error('Failed to update sprint:', error);
      if (error?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else if (error?.data?.message) {
        setErrors({ form: error.data.message });
      } else {
        setErrors({ form: 'Failed to update sprint. Please try again.' });
      }
    }
  };

  if (sprintLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const projects = projectsData?.data || [];
  const sprint = sprintData?.data as SprintData | undefined;

  return (
    <ProtectedRoute>
      <DashboardLayout user={user}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push(`/sprints/${sprintId}`)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sprint
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Sprint</h1>
                <p className="text-gray-600 mt-1">
                  Update sprint details and timeline
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Sprint #{sprint?.sprintNumber}
                </span>
                <button
                  onClick={() => router.push(`/sprints/${sprintId}`)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  View Sprint →
                </button>
              </div>
            </div>
          </div>

          {errors.form && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{errors.form}</span>
              </div>
            </div>
          )}

          {Object.keys(errors).filter(k => k !== 'form').length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="font-medium text-red-800">Please fix the following errors:</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700">
                {Object.entries(errors)
                  .filter(([field]) => field !== 'form')
                  .map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Sprint Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sprint Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sprint Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sprint Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Sprint 1: User Authentication"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project *
                      </label>
                      <select
                        name="project"
                        value={formData.project}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.project ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Project</option>
                        {projects.map((project: any) => (
                          <option key={project._id} value={project._id}>
                            {project.title} ({project.client})
                          </option>
                        ))}
                      </select>
                      {errors.project && (
                        <p className="mt-1 text-sm text-red-600">{errors.project}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sprint Goal
                      </label>
                      <textarea
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="What do you want to achieve in this sprint?"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sprint Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.startDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.endDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Duration Calculation */}
                  {formData.startDate && formData.endDate && !errors.endDate && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Sprint Duration:</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {Math.ceil(
                            (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 
                            (1000 * 3600 * 24)
                          )} days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Summary & Submit */}
              <div className="space-y-6">
                {/* Sprint Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sprint Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Project:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.project 
                          ? projects.find((p: any) => p._id === formData.project)?.title
                          : 'Not selected'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sprint Number:</span>
                      <span className="text-sm font-medium text-gray-900">
                        #{formData.sprintNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formData.startDate && formData.endDate
                          ? `${Math.ceil(
                              (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / 
                              (1000 * 3600 * 24)
                            )} days`
                          : 'Not set'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Progress:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {sprint?.progress || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Statistics */}
                {sprint?.stats && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Current Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Tasks:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {sprint.stats.totalTasks || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {sprint.stats.completedTasks || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Remaining:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(sprint.stats.totalTasks || 0) - (sprint.stats.completedTasks || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push(`/sprints/${sprintId}`)}
                      className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}