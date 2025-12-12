'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { useCreateTaskMutation } from '@/app/lib/api/taskApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import { useGetSprintsQuery } from '@/app/lib/api/sprintApi';
import { useGetTeamMembersQuery } from '@/app/lib/api/teamApi';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar,
  User,
  Tag,
  Clock,
  AlertCircle,
  Paperclip,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { TaskPriority, TaskStatus, UserRole } from '@/app/types';

export default function CreateTaskPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [createTask, { isLoading }] = useCreateTaskMutation();
  
  const { data: projectsData } = useGetProjectsQuery();
  const { data: sprintsData } = useGetSprintsQuery();
  const { data: teamData } = useGetTeamMembersQuery();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    sprint: '',
    assignees: [] as string[],
    estimatedHours: '',
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: [] as string[],
    attachments: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{ title: string; isCompleted: boolean }>>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const projects = projectsData?.data || [];
  const sprints = sprintsData?.data || [];
  const teamMembers = teamData?.data || [];

  // Filter sprints based on selected project
  const filteredSprints = sprints.filter((sprint: any) => 
    !formData.project || sprint.project._id === formData.project || sprint.project === formData.project
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAssigneeChange = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks(prev => [...prev, { title: subtaskInput.trim(), isCompleted: false }]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleSubtask = (index: number) => {
    setSubtasks(prev => prev.map((subtask, i) => 
      i === index ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.project) newErrors.project = 'Project is required';
    if (!formData.sprint && filteredSprints.length > 0) {
      // Sprint is optional, but show warning
      console.log('No sprint selected - task will be in backlog');
    }
    if (!formData.estimatedHours || parseFloat(formData.estimatedHours) <= 0) {
      newErrors.estimatedHours = 'Estimated hours must be greater than 0';
    }
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const taskData = {
        ...formData,
        estimatedHours: parseFloat(formData.estimatedHours),
        dueDate: new Date(formData.dueDate).toISOString(),
        subtasks: subtasks.length > 0 ? subtasks : undefined,
    
      };
      
      await createTask(taskData).unwrap();
      router.push('/tasks');
    } catch (error: any) {
      console.error('Failed to create task:', error);
      if (error?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        error.data.errors.forEach((err: any) => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        setErrors({ general: error?.data?.message || 'Failed to create task' });
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
              onClick={() => router.push('/tasks')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Tasks
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-gray-600 mt-1">
              Create a new task and assign it to team members
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Task Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Implement user authentication"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
                        placeholder="Describe the task requirements, acceptance criteria, and any specific instructions..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project & Sprint */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Project & Sprint</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {project.title}
                          </option>
                        ))}
                      </select>
                      {errors.project && (
                        <p className="mt-1 text-sm text-red-600">{errors.project}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sprint (Optional)
                      </label>
                      <select
                        name="sprint"
                        value={formData.sprint}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={!formData.project}
                      >
                        <option value="">No Sprint (Backlog)</option>
                        {filteredSprints.map((sprint: any) => (
                          <option key={sprint._id} value={sprint._id}>
                            Sprint #{sprint.sprintNumber}: {sprint.title}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {!formData.project ? 'Select a project first' : 
                         filteredSprints.length === 0 ? 'No sprints available for this project' : 
                         'Leave empty for backlog'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Subtasks</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Add a subtask"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    
                    {subtasks.length > 0 && (
                      <div className="space-y-2">
                        {subtasks.map((subtask, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={subtask.isCompleted}
                              onChange={() => handleToggleSubtask(index)}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span className={`ml-3 flex-1 ${subtask.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {subtask.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(index)}
                              className="ml-2 p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Assignees & Settings */}
              <div className="space-y-6">
                {/* Assignees */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Assignees</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {teamMembers
                      .filter((member: any) => member.isActive)
                      .map((member: any) => (
                        <label
                          key={member._id}
                          className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignees.includes(member._id)}
                            onChange={() => handleAssigneeChange(member._id)}
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
                              <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Task Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Task Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Hours *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="estimatedHours"
                          value={formData.estimatedHours}
                          onChange={handleChange}
                          step="0.5"
                          min="0.5"
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="8"
                        />
                      </div>
                      {errors.estimatedHours && (
                        <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.values(TaskPriority).map((priority) => (
                          <option key={priority} value={priority} className="capitalize">
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors.dueDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Add a tag"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                        >
                          Add
                        </button>
                      </div>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <div
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-indigo-600 hover:text-indigo-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
                          Creating Task...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Task
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/tasks')}
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