'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { 
  useGetProjectsQuery, 
  useDeleteProjectMutation 
} from '@/app/lib/api/projectApi';
import { useGetTeamMembersQuery } from '@/app/lib/api/teamApi';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Archive,
  Eye,
  ChevronDown,
  Grid,
  List,
  Download,
  Share2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ProjectStatus, UserRole } from '@/app/types';

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch projects with filters
  const { data: projectsData, isLoading, refetch } = useGetProjectsQuery({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    client: clientFilter !== 'all' ? clientFilter : undefined,
  });

  const { data: teamData } = useGetTeamMembersQuery();
  const [deleteProject] = useDeleteProjectMutation();

  const projects = projectsData?.data || [];

  // Get unique clients for filter
  const clients = Array.from(new Set(projects.map((p: any) => p.client)));

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await deleteProject(selectedProject._id).unwrap();
      setShowDeleteModal(false);
      setSelectedProject(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-50',
          badgeColor: 'bg-green-100 text-green-800',
        };
      case ProjectStatus.PLANNED:
        return {
          icon: Clock,
          color: 'text-blue-600 bg-blue-50',
          badgeColor: 'bg-blue-100 text-blue-800',
        };
      case ProjectStatus.COMPLETED:
        return {
          icon: CheckCircle,
          color: 'text-purple-600 bg-purple-50',
          badgeColor: 'bg-purple-100 text-purple-800',
        };
      case ProjectStatus.ARCHIVED:
        return {
          icon: Archive,
          color: 'text-gray-600 bg-gray-50',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600 bg-yellow-50',
          badgeColor: 'bg-yellow-100 text-yellow-800',
        };
    }
  };

  // Calculate project stats
  const calculateStats = () => {
    const total = projects.length;
    const active = projects.filter((p: any) => p.status === ProjectStatus.ACTIVE).length;
    const completed = projects.filter((p: any) => p.status === ProjectStatus.COMPLETED).length;
    const planned = projects.filter((p: any) => p.status === ProjectStatus.PLANNED).length;
    
    return { total, active, completed, planned };
  };

  const stats = calculateStats();

  return (
    <ProtectedRoute requiredRole={user?.role}>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your projects in one place
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              {user?.role !== UserRole.MEMBER && (
                <button
                  onClick={() => router.push('/projects/create')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Planned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.planned}</p>
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
                  placeholder="Search projects..."
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
                  {Object.values(ProjectStatus).map((status) => (
                    <option key={status} value={status} className="capitalize">
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
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

        {/* Projects Content */}
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
                    <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== 'all' || clientFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first project'}
              </p>
              {user?.role !== UserRole.MEMBER && (
                <button
                  onClick={() => router.push('/projects/create')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => {
                const StatusIcon = getStatusInfo(project.status).icon;
                const statusColor = getStatusInfo(project.status).badgeColor;
                
                return (
                  <div
                    key={project._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                  >
                    {/* Project Header */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-400" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {selectedProject?._id === project._id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button
                                onClick={() => {
                                  router.push(`/projects/${project._id}`);
                                  setSelectedProject(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  router.push(`/projects/${project._id}/edit`);
                                  setSelectedProject(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Project
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteModal(true);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Project Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      
                      {/* Status Badge */}
                      <div className="flex items-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{project.stats?.totalTasks || 0}</div>
                          <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{project.stats?.completedTasks || 0}</div>
                          <div className="text-xs text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{project.team?.length || 1}</div>
                          <div className="text-xs text-gray-500">Members</div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(project.endDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${project.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Team Avatars */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.team?.slice(0, 3).map((member: any) => (
                            <div
                              key={member._id}
                              className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                            >
                              <span className="text-xs font-medium text-indigo-600">
                                {member.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ))}
                          {project.team?.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{project.team.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => router.push(`/projects/${project._id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View Project →
                        </button>
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
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project: any) => {
                    const StatusIcon = getStatusInfo(project.status).icon;
                    const statusColor = getStatusInfo(project.status).badgeColor;
                    
                    return (
                      <tr key={project._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {project.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{project.client}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-32 mr-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {project.team?.slice(0, 3).map((member: any) => (
                              <div
                                key={member._id}
                                className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                              >
                                <span className="text-xs font-medium text-indigo-600">
                                  {member.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ))}
                            {project.team?.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  +{project.team.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(project.endDate), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${project.budget.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/projects/${project._id}`)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                            </button>
                            {user?.role !== UserRole.MEMBER && (
                              <>
                                <button
                                  onClick={() => router.push(`/projects/${project._id}/edit`)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4 text-gray-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-1 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </button>
                              </>
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
          {projects.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{Math.min(projects.length, 10)}</span> of{' '}
                <span className="font-medium">{projects.length}</span> results
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
                  <h3 className="font-bold text-gray-900">Delete Project</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this project?
                  </p>
                </div>
              </div>
              
              {selectedProject && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900">{selectedProject.title}</p>
                  <p className="text-sm text-gray-600">{selectedProject.client}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProject(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}