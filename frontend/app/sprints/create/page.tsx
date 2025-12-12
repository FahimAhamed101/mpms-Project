'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { useCreateSprintMutation, useGetSprintsQuery } from '@/app/lib/api/sprintApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import {
  ArrowLeft,
  Save,
  Calendar,
  Target,
  AlertCircle,
  ChevronDown,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function CreateSprintPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [createSprint, { isLoading }] = useCreateSprintMutation();
  const { data: projectsData } = useGetProjectsQuery();
  const { data: sprintsData } = useGetSprintsQuery({});
  
  const [formData, setFormData] = useState({
    title: '',
    project: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    goal: '',
    sprintNumber: 1, // Add sprintNumber to form data
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nextSprintNumber, setNextSprintNumber] = useState<number>(1);

  const projects = projectsData?.data || [];
  const allSprints = sprintsData?.data || [];

  // Calculate next sprint number when project is selected
  useEffect(() => {
    if (formData.project) {
      // Filter sprints for the selected project
      const projectSprints = allSprints.filter((sprint: any) => 
        sprint.project === formData.project || sprint.project?._id === formData.project
      );
      
      // Find the highest sprint number
      const highestSprintNumber = projectSprints.reduce((max: number, sprint: any) => {
        return Math.max(max, sprint.sprintNumber || 0);
      }, 0);
      
      const calculatedSprintNumber = highestSprintNumber + 1;
      setNextSprintNumber(calculatedSprintNumber);
      
      // Update form data with the calculated sprint number
      setFormData(prev => ({
        ...prev,
        sprintNumber: calculatedSprintNumber
      }));
      
      console.log('Project sprints:', projectSprints);
      console.log('Calculated sprint number:', calculatedSprintNumber);
    }
  }, [formData.project, allSprints]);

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
      
      // Validate sprint duration (typically 1-4 weeks)
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
    
    if (!validateForm()) return;
    
    // Ensure sprint number is set
    if (!formData.sprintNumber || formData.sprintNumber < 1) {
      setErrors({ general: 'Sprint number could not be calculated. Please select a project.' });
      return;
    }
    
    try {
      // Send sprint number along with other data
      const sprintData = {
        title: formData.title,
        project: formData.project,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        sprintNumber: formData.sprintNumber, // Include sprint number
        ...(formData.goal && { goal: formData.goal }), // Only include goal if it exists
      };
      
      console.log('Submitting sprint data:', sprintData);
      
      await createSprint(sprintData).unwrap();
      router.push('/sprints');
    } catch (error: any) {
      console.error('Failed to create sprint:', error);
      if (error?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: error?.data?.message || 'Failed to create sprint' });
      }
    }
  };

  return (
    <ProtectedRoute requiredRole={['admin', 'manager'].includes(user?.role || '') ? user?.role : 'admin'}>
      <DashboardLayout user={user}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/sprints')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sprints
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Sprint</h1>
            <p className="text-gray-600 mt-1">
              Plan a new development sprint for your project
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{errors.general}</span>
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
                      {formData.project && (
                        <p className="mt-1 text-xs text-gray-500">
                          This will be Sprint #{formData.sprintNumber} for this project
                        </p>
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
                      <p className="mt-1 text-xs text-gray-500">
                        Describe the main objective or outcome for this sprint
                      </p>
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
                      <p className="text-xs text-gray-500 mt-2">
                        Typical sprints are 1-4 weeks (7-30 days)
                      </p>
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
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Planned
                      </span>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Best Practices</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        Keep sprints short (1-4 weeks) for better focus
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        Define clear, achievable goals for each sprint
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        Include buffer time for reviews and testing
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        Align sprint dates with team availability
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Sprint...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Sprint
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/sprints')}
                      className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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