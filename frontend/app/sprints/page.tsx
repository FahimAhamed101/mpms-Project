'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { 
  useGetSprintsQuery,
  useDeleteSprintMutation 
} from '@/app/lib/api/sprintApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  List,
  Grid,
  Download,
  RefreshCw,
  BarChart,
} from 'lucide-react';
import { format, isBefore, isAfter } from 'date-fns';
import { UserRole } from '@/types';

export default function SprintsPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [draggedSprint, setDraggedSprint] = useState<any>(null);

  // Fetch sprints
  const { data: sprintsData, isLoading, refetch } = useGetSprintsQuery({
    projectId: projectFilter !== 'all' ? projectFilter : undefined,
  });

  // Fetch projects for filter
  const { data: projectsData } = useGetProjectsQuery();
  const [deleteSprint] = useDeleteSprintMutation();

  const sprints = sprintsData?.data || [];
  const projects = projectsData?.data || [];

  // Filter sprints by status
  const filteredSprints = sprints.filter((sprint: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      const now = new Date();
      const start = new Date(sprint.startDate);
      const end = new Date(sprint.endDate);
      return isBefore(start, now) && isAfter(end, now);
    }
    if (statusFilter === 'upcoming') {
      const now = new Date();
      const start = new Date(sprint.startDate);
      return isAfter(start, now);
    }
    if (statusFilter === 'completed') {
      const now = new Date();
      const end = new Date(sprint.endDate);
      return isAfter(now, end);
    }
    return true;
  });

  // Sort sprints by sprint number
  const sortedSprints = [...filteredSprints].sort((a, b) => a.sprintNumber - b.sprintNumber);

  // Get sprint status
  const getSprintStatus = (sprint: any) => {
    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    
    if (isBefore(now, start)) return 'upcoming';
    if (isAfter(now, end)) return 'completed';
    return 'active';
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: TrendingUp,
          color: 'text-green-600 bg-green-50',
          badgeColor: 'bg-green-100 text-green-800',
        };
      case 'upcoming':
        return {
          icon: Clock,
          color: 'text-blue-600 bg-blue-50',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-purple-600 bg-purple-50',
          badgeColor: 'bg-purple-100 text-purple-800',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
    }
  };

  // Calculate sprint stats
  const calculateStats = () => {
    const total = sprints.length;
    const active = sprints.filter((s: any) => getSprintStatus(s) === 'active').length;
    const upcoming = sprints.filter((s: any) => getSprintStatus(s) === 'upcoming').length;
    const completed = sprints.filter((s: any) => getSprintStatus(s) === 'completed').length;
    
    return { total, active, upcoming, completed };
  };

  const stats = calculateStats();

  // Handle drag and drop for reordering
  const handleDragStart = (sprint: any) => {
    setDraggedSprint(sprint);
  };

  const handleDragOver = (e: React.DragEvent, sprint: any) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetSprint: any) => {
    e.preventDefault();
    if (!draggedSprint || draggedSprint._id === targetSprint._id) return;

    // Here you would implement the reorder logic
    // For now, we'll just show an alert
    console.log(`Move ${draggedSprint.title} to position of ${targetSprint.title}`);
    setDraggedSprint(null);
  };

  // Handle sprint deletion
  const handleDeleteSprint = async () => {
    if (!selectedSprint) return;
    
    try {
      await deleteSprint(selectedSprint._id).unwrap();
      setShowDeleteModal(false);
      setSelectedSprint(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete sprint:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole={['admin', 'manager'].includes(user?.role || '') ? user?.role : 'admin'}>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
              <p className="text-gray-600 mt-1">
                Plan and manage development sprints for your projects
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {reorderMode ? (
                <>
                  <button
                    onClick={() => setReorderMode(false)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel Reorder
                  </button>
                  <button
                    onClick={() => setReorderMode(false)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Save Order
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setReorderMode(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <GripVertical className="h-4 w-4 mr-2" />
                    Reorder
                  </button>
                  <button
                    onClick={() => router.push('/sprints/create')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Sprint
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-3">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Sprints</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sprints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sprints Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedSprints.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || projectFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first sprint'}
              </p>
              <button
                onClick={() => router.push('/sprints/create')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sprint
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSprints.map((sprint: any) => {
                const status = getSprintStatus(sprint);
                const StatusIcon = getStatusInfo(status).icon;
                const statusColor = getStatusInfo(status).badgeColor;
                
                return (
                  <div
                    key={sprint._id}
                    draggable={reorderMode}
                    onDragStart={() => handleDragStart(sprint)}
                    onDragOver={(e) => handleDragOver(e, sprint)}
                    onDrop={(e) => handleDrop(e, sprint)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden group ${
                      reorderMode ? 'cursor-move' : ''
                    } ${draggedSprint?._id === sprint._id ? 'opacity-50' : ''}`}
                  >
                    {/* Drag handle for reorder mode */}
                    {reorderMode && (
                      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Sprint Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-500 mr-2">
                              Sprint #{sprint.sprintNumber}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600">
                            {sprint.title}
                          </h3>
                          <p className="text-sm text-gray-600">{sprint.project?.title}</p>
                        </div>
                        {!reorderMode && (
                          <div className="relative">
                            <button
                              onClick={() => setSelectedSprint(sprint)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="h-5 w-5 text-gray-400" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {selectedSprint?._id === sprint._id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <button
                                  onClick={() => {
                                    router.push(`/sprints/${sprint._id}`);
                                    setSelectedSprint(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    router.push(`/sprints/${sprint._id}/edit`);
                                    setSelectedSprint(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Sprint
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDeleteModal(true);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Sprint
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Sprint Goal */}
                      {sprint.goal && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {sprint.goal}
                          </p>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{sprint.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${sprint.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{sprint.stats?.totalTasks || 0}</div>
                          <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{sprint.stats?.completedTasks || 0}</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">
                            {sprint.duration || Math.ceil(
                              (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / 
                              (1000 * 3600 * 24)
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Days</div>
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(sprint.startDate), 'MMM d')}
                          </div>
                          <div className="h-px flex-1 bg-gray-300 mx-2"></div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(sprint.endDate), 'MMM d')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => router.push(`/sprints/${sprint._id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View Sprint →
                        </button>
                        
                        {/* Days remaining/elapsed */}
                        {status === 'active' && (
                          <span className="text-xs font-medium text-green-600">
                            {Math.ceil(
                              (new Date(sprint.endDate).getTime() - new Date().getTime()) / 
                              (1000 * 3600 * 24)
                            )} days left
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sprint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSprints.map((sprint: any) => {
                    const status = getSprintStatus(sprint);
                    const StatusIcon = getStatusInfo(status).icon;
                    const statusColor = getStatusInfo(status).badgeColor;
                    
                    return (
                      <tr 
                        key={sprint._id}
                        draggable={reorderMode}
                        onDragStart={() => handleDragStart(sprint)}
                        onDragOver={(e) => handleDragOver(e, sprint)}
                        onDrop={(e) => handleDrop(e, sprint)}
                        className={`hover:bg-gray-50 ${reorderMode ? 'cursor-move' : ''} ${
                          draggedSprint?._id === sprint._id ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{sprint.title}</div>
                            <div className="text-sm text-gray-500">
                              Sprint #{sprint.sprintNumber}
                            </div>
                            {sprint.goal && (
                              <div className="text-sm text-gray-600 truncate max-w-xs mt-1">
                                {sprint.goal}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{sprint.project?.title}</div>
                          <div className="text-xs text-gray-500">{sprint.project?.client}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-32 mr-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${sprint.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{sprint.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.ceil(
                              (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / 
                              (1000 * 3600 * 24)
                            )} days
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">
                              {sprint.stats?.completedTasks || 0}/{sprint.stats?.totalTasks || 0}
                            </div>
                            <div className="text-xs text-gray-500">Tasks</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/sprints/${sprint._id}`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => router.push(`/sprints/${sprint._id}/edit`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSprint(sprint);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Reorder Instructions */}
          {reorderMode && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <GripVertical className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Reorder Mode Active
                  </p>
                  <p className="text-sm text-blue-700">
                    Drag and drop sprints to reorder them. Click "Save Order" when done.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {sortedSprints.length > 0 && !reorderMode && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{Math.min(sortedSprints.length, 10)}</span> of{' '}
                <span className="font-medium">{sortedSprints.length}</span> results
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
                  <h3 className="font-bold text-gray-900">Delete Sprint</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this sprint?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Note: Tasks in this sprint will be moved to "No Sprint"
                  </p>
                </div>
              </div>
              
              {selectedSprint && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900">{selectedSprint.title}</p>
                  <p className="text-sm text-gray-600">
                    Sprint #{selectedSprint.sprintNumber} - {selectedSprint.project?.title}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedSprint(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSprint}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Sprint
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}