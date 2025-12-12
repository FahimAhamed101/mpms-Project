'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { 
  useGetTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation 
} from '@/app/lib/api/taskApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import KanbanBoard from '@/app/components/tasks/KanbanBoard';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  Paperclip,
  MessageSquare,
  Grid,
  List,
  ChevronDown,
  Download,
  Filter as FilterIcon,
  RefreshCw,
  BarChart,
} from 'lucide-react';
import { format } from 'date-fns';
import { TaskStatus, TaskPriority, UserRole } from '@/app/types';

export default function TasksPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

const { data: tasksData, isLoading, refetch } = useGetTasksQuery({
  search: searchTerm || undefined,
  status: statusFilter !== 'all' ? (statusFilter as TaskStatus) : undefined,
  priority: priorityFilter !== 'all' ? (priorityFilter as TaskPriority) : undefined,
  project: projectFilter !== 'all' ? projectFilter : undefined,
  assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
});

  // Fetch projects for filter
  const { data: projectsData } = useGetProjectsQuery();
  const [updateTaskStatus] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const tasks = tasksData?.data || [];
  const projects = projectsData?.data || [];

  // Get status icon and color
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
      case TaskStatus.IN_PROGRESS:
        return {
          icon: RefreshCw,
          color: 'text-blue-600 bg-blue-50',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case TaskStatus.REVIEW:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600 bg-yellow-50',
          badgeColor: 'bg-yellow-100 text-yellow-800',
        };
      case TaskStatus.DONE:
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50',
          badgeColor: 'bg-green-100 text-green-800',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
    }
  };

  // Get priority icon and color
  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return {
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
          label: 'Low',
        };
      case TaskPriority.MEDIUM:
        return {
          color: 'text-blue-600 bg-blue-50',
          badgeColor: 'bg-blue-100 text-blue-800',
          label: 'Medium',
        };
      case TaskPriority.HIGH:
        return {
          color: 'text-orange-600 bg-orange-50',
          badgeColor: 'bg-orange-100 text-orange-800',
          label: 'High',
        };
      case TaskPriority.URGENT:
        return {
          color: 'text-red-600 bg-red-50',
          badgeColor: 'bg-red-100 text-red-800',
          label: 'Urgent',
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
          label: 'Low',
        };
    }
  };

  // Handle status update
  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await deleteTask(selectedTask._id).unwrap();
      setShowDeleteModal(false);
      setSelectedTask(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Calculate task stats
  const calculateStats = () => {
    const total = tasks.length;
    const todo = tasks.filter((t: any) => t.status === TaskStatus.TODO).length;
    const inProgress = tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length;
    const review = tasks.filter((t: any) => t.status === TaskStatus.REVIEW).length;
    const done = tasks.filter((t: any) => t.status === TaskStatus.DONE).length;
    
    return { total, todo, inProgress, review, done };
  };

  const stats = calculateStats();

  return (
    <ProtectedRoute>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-1">
                Track and manage all your tasks
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => refetch()}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              
              {user?.role !== UserRole.MEMBER && (
                <button
                  onClick={() => router.push('/tasks/create')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">To Do</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todo}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center mr-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.review}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Done</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.done}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
                  <BarChart className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and View Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  {Object.values(TaskStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Priority</option>
                  {Object.values(TaskPriority).map((priority) => (
                    <option key={priority} value={priority} className="capitalize">
                      {priority}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map((project: any) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 ${viewMode === 'kanban' ? 'bg-gray-100' : 'bg-white'}`}
                  title="Kanban View"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : user?.role !== UserRole.MEMBER
                  ? 'Get started by creating your first task'
                  : 'No tasks have been assigned to you yet'}
              </p>
              {user?.role !== UserRole.MEMBER && (
                <button
                  onClick={() => router.push('/tasks/create')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </button>
              )}
            </div>
          ) : viewMode === 'kanban' ? (
            // Kanban View
            <KanbanBoard tasks={tasks} />
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task: any) => {
                    const StatusIcon = getStatusInfo(task.status).icon;
                    const statusColor = getStatusInfo(task.status).badgeColor;
                    const priorityInfo = getPriorityInfo(task.priority);
                    
                    return (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                            <div className="flex items-center mt-1 space-x-2">
                              {task.attachments?.length > 0 && (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  {task.attachments.length}
                                </span>
                              )}
                              {task.tags?.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{task.project?.title}</div>
                          <div className="text-xs text-gray-500">
                            {task.sprint?.title || 'No Sprint'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {task.assignees?.slice(0, 3).map((assignee: any) => (
                              <div
                                key={assignee._id}
                                className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                                title={assignee.name}
                              >
                                <span className="text-xs font-medium text-indigo-600">
                                  {assignee.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ))}
                            {task.assignees?.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  +{task.assignees.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityInfo.badgeColor}`}>
                            {priorityInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.estimatedHours} hrs
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusUpdate(task._id, e.target.value as TaskStatus)}
                              className={`text-xs font-medium rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${statusColor}`}
                            >
                              {Object.values(TaskStatus).map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/tasks/${task._id}`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                            </button>
                            {(user?.role !== UserRole.MEMBER || task.assignees?.some((a: any) => a._id === user?._id)) && (
                              <button
                                onClick={() => router.push(`/tasks/${task._id}/edit`)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4 text-gray-400" />
                              </button>
                            )}
                            {user?.role !== UserRole.MEMBER && (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {tasks.length > 0 && viewMode === 'list' && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{Math.min(tasks.length, 20)}</span> of{' '}
                <span className="font-medium">{tasks.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 bg-gray-50 rounded text-sm font-medium">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delete Task</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this task?
                  </p>
                </div>
              </div>
              
              {selectedTask && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900">{selectedTask.title}</p>
                  <p className="text-sm text-gray-600">{selectedTask.project?.title}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}