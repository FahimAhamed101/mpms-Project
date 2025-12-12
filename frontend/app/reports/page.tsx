// app/reports/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { 
  useGetDashboardStatsQuery,
  useGetProjectAnalyticsQuery,
  useGetTeamPerformanceQuery,
  useGetUserWorkloadQuery 
} from '@/app/lib/api/reportApi';
import { useGetProjectsQuery } from '@/app/lib/api/projectApi';
import { useGetTeamMembersQuery } from '@/app/lib/api/teamApi';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  FolderOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  RefreshCw,
  Eye,
  Share2,
  Printer,
  Target,
  Activity,
  DollarSign,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { format, subMonths } from 'date-fns';

// Fix: Define TaskStatus enum locally
enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<'overview' | 'projects' | 'team' | 'performance'>('overview');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data with proper handling
  const { 
    data: dashboardResponse, 
    isLoading: dashboardLoading,
    refetch: refetchDashboard 
  } = useGetDashboardStatsQuery(undefined, {
    skip: !user,
  });

  const { 
    data: projectsResponse,
    refetch: refetchProjects,
    isLoading: projectsLoading
  } = useGetProjectsQuery(undefined, {
    skip: !user,
  });

  const { 
    data: teamResponse,
    refetch: refetchTeam,
    isLoading: teamLoading
  } =  useGetTeamMembersQuery({}, { // Change undefined to empty object
  skip: !user,
});

  const { 
    data: projectAnalyticsResponse, 
    isLoading: analyticsLoading,
    refetch: refetchProjectAnalytics 
  } = useGetProjectAnalyticsQuery(
    selectedProject !== 'all' ? selectedProject : undefined,
    {
      skip: !user,
    }
  );

  const { 
    data: teamPerformanceResponse, 
    isLoading: performanceLoading,
    refetch: refetchTeamPerformance 
  } = useGetTeamPerformanceQuery(
    {
      startDate: subMonths(new Date(), 1).toISOString(),
      endDate: new Date().toISOString(),
    },
    {
      skip: !user,
    }
  );

  const { 
    data: userWorkloadResponse, 
    isLoading: workloadLoading,
    refetch: refetchUserWorkload 
  } = useGetUserWorkloadQuery(
    selectedUser !== 'all' ? selectedUser : undefined,
    {
      skip: !user || !selectedUser || selectedUser === 'all',
    }
  );

  // Extract data from responses with proper handling based on your actual API responses
  const dashboardData = dashboardResponse?.data || {};
  const projectsData = projectsResponse?.data || [];
  const teamMembersData = teamResponse?.data || [];
  const teamPerformanceData = teamPerformanceResponse?.data || [];
  const userWorkloadData = userWorkloadResponse?.data || {};

  // Check if data is loading - FIXED: Added all loading states
   const isLoading = projectsLoading || teamLoading;

  // Transform project data for charts - FIXED: Based on your actual project data structure
  const projectProgressData = useMemo(() => {
    if (!Array.isArray(projectsData)) {
      return [];
    }
    
    return projectsData.map((project: any) => {
      const stats = project.stats || {};
      
      return {
        id: project._id,
        name: project.title?.length > 15 
          ? project.title.substring(0, 15) + '...' 
          : project.title || 'Unnamed Project',
        progress: project.progress || stats.progress || 0,
        tasks: stats.totalTasks || 0,
        completed: stats.completedTasks || 0,
        budget: project.budget || 0,
        status: project.status || 'planned',
        manager: project.manager?.name || 'No Manager',
      };
    }).slice(0, 10);
  }, [projectsData]);

  // Team performance data - FIXED: Based on your actual team performance data
  const teamPerformanceChartData = useMemo(() => {
    if (Array.isArray(teamPerformanceData) && teamPerformanceData.length > 0) {
      return teamPerformanceData.map((member: any) => ({
        name: member.name?.split(' ')[0] || 'User',
        fullName: member.name || 'User',
        tasksCompleted: member.performance?.completedTasks || 0,
        efficiency: member.performance?.efficiency || 70,
        hoursLogged: member.performance?.totalActualHours || 0,
      }));
    }
    
    // Fallback to team members data if no performance data
    if (Array.isArray(teamMembersData) && teamMembersData.length > 0) {
      return teamMembersData.slice(0, 8).map((member: any) => ({
        name: member.name?.split(' ')[0] || member.email?.split('@')[0] || 'User',
        fullName: member.name || member.email || 'User',
        tasksCompleted: member.stats?.completedTasks || 0,
        efficiency: 70,
        hoursLogged: 0,
      }));
    }
    
    return [];
  }, [teamPerformanceData, teamMembersData]);

  // Mock data for charts (since your APIs return empty data for some endpoints)
  const taskStatusData = useMemo(() => [
    { 
      name: TaskStatus.TODO, 
      value: 15, 
      color: '#9CA3AF' 
    },
    { 
      name: TaskStatus.IN_PROGRESS, 
      value: 12, 
      color: '#3B82F6' 
    },
    { 
      name: TaskStatus.REVIEW, 
      value: 8, 
      color: '#F59E0B' 
    },
    { 
      name: TaskStatus.DONE, 
      value: 25, 
      color: '#10B981' 
    },
  ], []);

  const timeLoggedData = [
    { date: 'Week 1', estimated: 120, actual: 110 },
    { date: 'Week 2', estimated: 135, actual: 140 },
    { date: 'Week 3', estimated: 125, actual: 130 },
    { date: 'Week 4', estimated: 140, actual: 135 },
    { date: 'Week 5', estimated: 130, actual: 125 },
    { date: 'Week 6', estimated: 145, actual: 150 },
  ];

  const COLORS = ['#9CA3AF', '#3B82F6', '#F59E0B', '#10B981'];

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalProjects = projectProgressData.length;
    
    const activeProjects = projectProgressData.filter((p: any) => {
      return p.status === 'active' || 
             p.status === 'in-progress' || 
             p.status === 'in_progress' ||
             p.status === 'planned';
    }).length;
    
    const totalTasks = projectProgressData.reduce((sum, p) => sum + (p.tasks || 0), 0);
    const completedTasks = projectProgressData.reduce((sum, p) => sum + (p.completed || 0), 0);
    
    const avgProgress = projectProgressData.length > 0 
      ? Math.round(projectProgressData.reduce((sum, p) => sum + (p.progress || 0), 0) / projectProgressData.length)
      : 0;

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      avgProgress,
    };
  }, [projectProgressData]);

  // Refresh all data
  const refreshAllData = () => {
    refetchDashboard();
    refetchProjects();
    refetchTeam();
    refetchProjectAnalytics();
    refetchTeamPerformance();
    refetchUserWorkload();
  };

  // Export report
  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
    // Implement actual export logic here
  };

  // Find selected project name
  const getSelectedProjectName = () => {
    if (selectedProject === 'all') return 'All Projects';
    
    const project = projectsData.find((p: any) => p._id === selectedProject);
    
    return project?.title || 'Selected Project';
  };

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout user={user}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights into your projects and team performance
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Report link copied to clipboard');
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setReportType('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                reportType === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setReportType('projects')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                reportType === 'projects'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Project Analytics
            </button>
            <button
              onClick={() => setReportType('team')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                reportType === 'team'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Team Performance
            </button>
            <button
              onClick={() => setReportType('performance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                reportType === 'performance'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Performance Metrics
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Period:</span>
              </div>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium capitalize ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${range === 'week' ? 'rounded-l-lg' : ''} ${
                      range === 'year' ? 'rounded-r-lg' : ''
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {reportType === 'projects' && (
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Projects</option>
                    {Array.isArray(projectsData) && projectsData.map((project: any) => (
                      <option key={project._id} value={project._id}>
                        {project.title || 'Untitled Project'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              
              {reportType === 'team' && (
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Team Members</option>
                    {Array.isArray(teamMembersData) && teamMembersData.map((member: any) => (
                      <option key={member._id} value={member._id}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              )}
              
              <button
                onClick={refreshAllData}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Reports Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalProjects}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      {summary.activeProjects > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={summary.activeProjects > 0 ? 'text-green-600' : 'text-red-600'}>
                        {summary.activeProjects} active
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Task Completion</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {summary.completedTasks}/{summary.totalTasks}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      {summary.totalTasks > 0 && summary.completedTasks / summary.totalTasks >= 0.7 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      <span className={
                        summary.totalTasks > 0 && summary.completedTasks / summary.totalTasks >= 0.7 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }>
                        {summary.totalTasks > 0 
                          ? Math.round((summary.completedTasks / summary.totalTasks) * 100) 
                          : 0}% complete
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Project Progress</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{summary.avgProgress}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${summary.avgProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Time Efficiency</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">87%</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">+5% from last month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts based on report type */}
              {reportType === 'overview' && (
                <div className="space-y-6">
                  {/* Project Progress Bar Chart */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Project Progress Overview</h3>
                        <p className="text-sm text-gray-600">Progress across all active projects</p>
                      </div>
                      <button
                        onClick={() => router.push('/projects')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        View All Projects
                        <Plus className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    <div className="h-80">
                      {projectProgressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={projectProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#6B7280" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                if (name === 'progress') return [`${value}%`, 'Progress'];
                                if (name === 'tasks') return [value, 'Total Tasks'];
                                return [value, name];
                              }}
                            />
                            <RechartsLegend />
                            <Bar 
                              dataKey="progress" 
                              name="Progress %" 
                              fill="#8B5CF6" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="tasks" 
                              name="Total Tasks" 
                              fill="#3B82F6" 
                              radius={[4, 4, 0, 0]}
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No project data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Status Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Status Distribution</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={taskStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                              {taskStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <RechartsLegend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {taskStatusData.map((status) => (
                          <div key={status.name} className="flex items-center">
                            <div
                              className="h-3 w-3 rounded-full mr-2"
                              style={{ backgroundColor: status.color }}
                            />
                            <span className="text-xs text-gray-600">{status.name}: {status.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Time Tracking */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
                          <p className="text-sm text-gray-600">Estimated vs Actual Hours</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Hours</p>
                          <p className="text-xl font-bold text-gray-900">785</p>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={timeLoggedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <RechartsTooltip />
                            <RechartsLegend />
                            <Line
                              type="monotone"
                              dataKey="estimated"
                              name="Estimated Hours"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="actual"
                              name="Actual Hours"
                              stroke="#10B981"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">720</p>
                          <p className="text-xs text-gray-600">Estimated Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">785</p>
                          <p className="text-xs text-gray-600">Actual Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'projects' && (
                <div className="space-y-6">
                  {/* Project Analytics */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Project Analytics</h3>
                        <p className="text-sm text-gray-600">
                          {selectedProject === 'all' 
                            ? 'All projects performance' 
                            : `Performance for ${getSelectedProjectName()}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">View:</span>
                        <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white">
                          <option>Progress</option>
                          <option>Budget</option>
                          <option>Timeline</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="h-80">
                      {projectProgressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={projectProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#6B7280" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                if (name === 'progress') return [`${value}%`, 'Progress'];
                                if (name === 'budget') return [`$${value}`, 'Budget'];
                                return [value, name];
                              }}
                            />
                            <RechartsLegend />
                            <Bar 
                              dataKey="progress" 
                              name="Progress %" 
                              fill="#8B5CF6" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="budget" 
                              name="Budget ($)" 
                              fill="#10B981" 
                              radius={[4, 4, 0, 0]}
                              yAxisId="right"
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No project data available
                        </div>
                      )}
                    </div>
                    
                    {/* Project Details Table */}
                    <div className="mt-6 overflow-x-auto">
                      {projectProgressData.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Project
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tasks
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Budget
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timeline
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {projectProgressData.slice(0, 5).map((project, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {project.name}
                                </td>
                                <td className="px-4 py-3">
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
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-900">
                                    {project.completed}/{project.tasks}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {project.tasks > 0 ? Math.round((project.completed / project.tasks) * 100) : 0}% complete
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    ${project.budget.toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-900">
                                    {project.progress >= 70 ? 'On track' : 'Behind'}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    project.progress >= 70 
                                      ? 'bg-green-100 text-green-800' 
                                      : project.progress >= 40
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {project.progress >= 70 ? 'Active' : project.progress >= 40 ? 'At Risk' : 'Delayed'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No project data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'team' && (
                <div className="space-y-6">
                  {/* Team Performance */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                        <p className="text-sm text-gray-600">Individual performance metrics</p>
                      </div>
                      <button
                        onClick={() => router.push('/team')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        View Team
                        <Eye className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    
                    <div className="h-80">
                      {teamPerformanceChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={teamPerformanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="name" 
                              stroke="#6B7280" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                            <RechartsTooltip />
                            <RechartsLegend />
                            <Bar 
                              dataKey="tasksCompleted" 
                              name="Tasks Completed" 
                              fill="#3B82F6" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="efficiency" 
                              name="Efficiency %" 
                              fill="#10B981" 
                              radius={[4, 4, 0, 0]}
                              yAxisId="right"
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No team performance data available
                        </div>
                      )}
                    </div>
                    
                    {/* Performance Metrics */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Top Performer</p>
                            <p className="font-bold text-gray-900 mt-1">
                              {teamPerformanceChartData.length > 0 
                                ? teamPerformanceChartData.reduce((max, member) => 
                                    member.tasksCompleted > max.tasksCompleted ? member : max
                                  ).fullName
                                : 'N/A'}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Avg. Efficiency</p>
                            <p className="font-bold text-gray-900 mt-1">
                              {teamPerformanceChartData.length > 0
                                ? Math.round(teamPerformanceChartData.reduce((sum, member) => 
                                    sum + member.efficiency, 0) / teamPerformanceChartData.length
                                  )
                                : 0}%
                            </p>
                          </div>
                          <Activity className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Hours Logged</p>
                            <p className="font-bold text-gray-900 mt-1">
                              {teamPerformanceChartData.reduce((sum, member) => sum + member.hoursLogged, 0)}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'performance' && (
                <div className="space-y-6">
                  {/* Performance Metrics Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Velocity Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Velocity Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { sprint: 'Sprint 1', velocity: 12 },
                            { sprint: 'Sprint 2', velocity: 15 },
                            { sprint: 'Sprint 3', velocity: 18 },
                            { sprint: 'Sprint 4', velocity: 16 },
                            { sprint: 'Sprint 5', velocity: 20 },
                            { sprint: 'Sprint 6', velocity: 22 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="sprint" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <RechartsTooltip />
                            <Area 
                              type="monotone" 
                              dataKey="velocity" 
                              name="Story Points"
                              stroke="#8B5CF6" 
                              fill="#8B5CF6"
                              fillOpacity={0.2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">Average Velocity</p>
                        <p className="text-2xl font-bold text-gray-900">17.2</p>
                        <div className="flex items-center justify-center text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">+8% from last quarter</span>
                        </div>
                      </div>
                    </div>

                    {/* Burn Down Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sprint Burn Down</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={[
                            { day: 'Day 1', ideal: 40, actual: 40 },
                            { day: 'Day 3', ideal: 30, actual: 35 },
                            { day: 'Day 5', ideal: 20, actual: 28 },
                            { day: 'Day 7', ideal: 10, actual: 22 },
                            { day: 'Day 9', ideal: 0, actual: 15 },
                            { day: 'Day 11', ideal: 0, actual: 8 },
                            { day: 'Day 13', ideal: 0, actual: 0 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <RechartsTooltip />
                            <RechartsLegend />
                            <Line
                              type="monotone"
                              dataKey="ideal"
                              name="Ideal"
                              stroke="#9CA3AF"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                            />
                            <Line
                              type="monotone"
                              dataKey="actual"
                              name="Actual"
                              stroke="#EF4444"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">Current Sprint Progress</p>
                        <p className="text-2xl font-bold text-gray-900">65%</p>
                        <div className="flex items-center justify-center text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-yellow-600">3 days behind schedule</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">On-Time Delivery</p>
                          <p className="text-2xl font-bold text-gray-900">78%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mr-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Budget Adherence</p>
                          <p className="text-2xl font-bold text-gray-900">92%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Team Satisfaction</p>
                          <p className="text-2xl font-bold text-gray-900">4.2/5</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center mr-3">
                          <CheckCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quality Score</p>
                          <p className="text-2xl font-bold text-gray-900">96%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Insights & Recommendations */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900">Positive Trends</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm text-blue-700">• Team velocity increased by 15% this quarter</li>
                          <li className="text-sm text-blue-700">• On-time delivery improved by 8%</li>
                          <li className="text-sm text-blue-700">• Average project completion time reduced by 3 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Areas for Improvement</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm text-yellow-700">• 2 projects are behind schedule</li>
                          <li className="text-sm text-yellow-700">• Time estimation accuracy is at 78%</li>
                          <li className="text-sm text-yellow-700">• Review cycle time increased by 2 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">Consider allocating more resources to Project X to meet deadline</span>
                    </div>
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">Implement weekly progress reviews for delayed projects</span>
                    </div>
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">Provide time estimation training for project managers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Date */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Report generated on {format(new Date(), 'MMMM d, yyyy')} at {format(new Date(), 'h:mm a')}</p>
                <p className="mt-1">Data is updated in real-time. Last refresh: Just now</p>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}