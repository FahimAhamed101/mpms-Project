'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { useCreateProjectMutation } from '@/app/lib/api/projectApi';
import { useGetTeamMembersQuery } from '@/app/lib/api/teamApi';
import {
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  DollarSign,
  Users,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { ProjectStatus, UserRole } from '@/app/types';

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const { data: teamResponse } = useGetTeamMembersQuery();
  
  // Extract team members data from the response
  const teamMembers = teamResponse?.data || [];
  
  // Debug logs
  useEffect(() => {
    console.log('Current User:', user);
    console.log('Team Members:', teamMembers);
  }, [user, teamMembers]);
  
  // Initialize form
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: '',
    status: ProjectStatus.PLANNED,
    manager: '',
    team: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Set manager ID when user is available
  useEffect(() => {
    if (user?._id) {
      console.log('Setting manager ID:', user._id);
      setFormData(prev => ({
        ...prev,
        manager: user._id
      }));
    }
  }, [user?._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTeamChange = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.includes(userId)
        ? prev.team.filter(id => id !== userId)
        : [...prev.team, userId]
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.client.trim()) newErrors.client = 'Client is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
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
    
    // Get manager ID - prefer formData.manager, fallback to user._id
    const managerIdToUse = formData.manager || user?._id;
    
    if (!managerIdToUse) {
      alert('Unable to determine manager. Please refresh the page and try again.');
      return;
    }
    
    try {
      // Prepare the payload - include manager in the team array if they have manager role
      const projectData = {
        title: formData.title,
        client: formData.client,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        budget: parseFloat(formData.budget),
        status: formData.status,
        manager: managerIdToUse,
        // Include all selected team members plus the manager
        team: [...formData.team, managerIdToUse],
      };
      
      console.log('Submitting project data:', projectData);
      
      const result = await createProject(projectData).unwrap();
      console.log('Project created successfully:', result);
      router.push('/projects');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      if (error?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else if (error?.data?.message) {
        alert(error.data.message);
      }
    }
  };

  // Filter team members - show all members except current user (manager)
  const availableTeamMembers = teamMembers.filter((member: any) => 
    member._id !== user?._id && (member.role === UserRole.MEMBER || member.role === 'member')
  );

  // Get all managers for the manager selection dropdown
  const availableManagers = teamMembers.filter((member: any) => 
    member.role === UserRole.MANAGER || member.role === 'manager' || member.role === 'admin'
  );

  return (
    <ProtectedRoute requiredRole={['admin', 'manager'].includes(user?.role || '') ? user?.role : 'admin'}>
      <DashboardLayout user={user}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Projects
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-1">
              Fill in the details to create a new project
            </p>
            {/* Debug info */}
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <p>Logged in as: {user?.name} (ID: {user?._id})</p>
              <p>Manager field: {formData.manager || 'Not set yet'}</p>
              <p>Team members selected: {formData.team.length}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Title */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter project title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.client ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter client name"
                      />
                      {errors.client && (
                        <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe the project..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>

                    {/* Manager Selection Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Manager *
                      </label>
                      <select
                        name="manager"
                        value={formData.manager}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select a manager</option>
                        {availableManagers.map((manager: any) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name} ({manager.role})
                          </option>
                        ))}
                      </select>
                      {errors.manager && (
                        <p className="mt-1 text-sm text-red-600">{errors.manager}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline & Budget */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Timeline & Budget</h3>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.budget ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.budget && (
                        <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.values(ProjectStatus).map((status) => (
                          <option key={status} value={status} className="capitalize">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Team & Thumbnail */}
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Project Thumbnail</h3>
                  <div className="space-y-4">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnail(null);
                            setThumbnailPreview('');
                          }}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer">
                          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Click to upload thumbnail
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Team Selection */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Team Members</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    The project manager will be automatically added to the team
                  </p>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {availableTeamMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-sm text-gray-500">No additional team members available</p>
                      </div>
                    ) : (
                      availableTeamMembers.map((member: any) => (
                        <label
                          key={member._id}
                          className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.team.includes(member._id)}
                            onChange={() => handleTeamChange(member._id)}
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="ml-3 flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {member.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{member.name}</p>
                              <div className="flex items-center">
                                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                {member.department && (
                                  <>
                                    <span className="mx-1 text-gray-400">•</span>
                                    <p className="text-xs text-gray-500">{member.department}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Selected: {formData.team.length} member(s) + 1 manager
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
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/projects')}
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