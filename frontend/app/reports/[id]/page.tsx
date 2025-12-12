'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/lib/store';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { useGetProjectProgressQuery } from '@/app/lib/api/reportApi';
import { useGetProjectByIdQuery } from '@/app/lib/api/projectApi';
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  BarChart,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';

export default function ProjectReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const projectId = params.id as string;

  const { data: projectData, isLoading: projectLoading } = useGetProjectByIdQuery(projectId);
  const { data: reportData, isLoading: reportLoading } = useGetProjectProgressQuery(projectId);

  const project = projectData?.data;
  const report = reportData?.data;

  if (projectLoading || reportLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!project || !report) {
    return (
      <ProtectedRoute>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
              <button
                onClick={() => router.push('/reports')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Mock chart data
  const taskProgressData = [
    { week: 'Week 1', completed: 2, total: 8 },
    { week: 'Week 2', completed: 5, total: 10 },
    { week: 'Week 3', completed: 8, total: 12 },
    { week: 'Week 4', completed: 11, total: 15 },
    { week: 'Week 5', completed: 15, total: 18 },
  ];

  const timeTrackingData = [
    { member: 'John D', estimated: 40, actual: 38 },
    { member: 'Jane S', estimated: 35, actual: 40 },
    { member: 'Mike W', estimated: 45, actual: 42 },
    { member: 'Sarah J', estimated: 30, actual: 32 },
  ];

  const budgetData = [
    { category: 'Development', allocated: 15000, spent: 13500 },
    { category: 'Design', allocated: 8000, spent: 7200 },
    { category: 'Testing', allocated: 5000, spent: 4200 },
    { category: 'Management', allocated: 7000, spent: 6500 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <ProtectedRoute>
      <DashboardLayout user={user}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/reports')}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Reports
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title} - Project Report</h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive analysis for {project.client} project
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Budget: ${project.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Team: {project.team?.length || 1} members
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {report.statistics?.completedTasks || 0} tasks completed
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {report.statistics?.inProgressTasks || 0} in progress
                      </span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {report.statistics?.overdueTasks || 0} overdue
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Overall Progress</span>
                  <span className="font-bold text-gray-900">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.statistics?.completedTasks || 0}/{report.statistics?.totalTasks || 0}
                  </p>
                  <div className="flex items-center text-sm mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">
                      {report.statistics?.totalTasks > 0 
                        ? Math.round((report.statistics.completedTasks / report.statistics.totalTasks) * 100) 
                        : 0}% completion rate
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Time Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.statistics?.efficiency || 0}%
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    {report.statistics?.totalEstimatedHours || 0} estimated / {report.statistics?.totalActualHours || 0} actual hours
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Budget Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((report.statistics?.totalActualHours || 0) * 50 / project.budget * 100)}%
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    ${Math.round((report.statistics?.totalActualHours || 0) * 50).toLocaleString()} spent
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Task Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Progress Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={taskProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed Tasks"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Tasks"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Tracking Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Time Tracking</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={timeTrackingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="member" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="estimated" 
                      name="Estimated Hours" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="actual" 
                      name="Actual Hours" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="category" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Legend />
                  <Bar 
                    dataKey="allocated" 
                    name="Allocated Budget" 
                    fill="#9CA3AF" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="spent" 
                    name="Amount Spent" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              {budgetData.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-900">{item.category}</p>
                  <p className="text-lg font-bold text-gray-900">${item.spent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">of ${item.allocated.toLocaleString()}</p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-indigo-600 h-1 rounded-full"
                      style={{ width: `${Math.min(100, (item.spent / item.allocated) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900">Schedule Risk</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Project is currently {report.statistics?.overdueTasks || 0} tasks behind schedule. 
                    Consider reallocating resources or adjusting deadlines.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900">Budget Status</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Project is currently under budget by approximately 12%. 
                    Consider allocating additional funds to quality assurance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900">Team Performance</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Team is performing at {report.statistics?.efficiency || 0}% efficiency. 
                    Consider providing additional training for time estimation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">1</span>
                </div>
                <p className="text-sm text-gray-700">
                  Prioritize completion of overdue tasks to get back on schedule
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">2</span>
                </div>
                <p className="text-sm text-gray-700">
                  Allocate remaining budget to user testing and quality assurance
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">3</span>
                </div>
                <p className="text-sm text-gray-700">
                  Schedule weekly progress reviews with the project team
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-xs font-bold text-indigo-600">4</span>
                </div>
                <p className="text-sm text-gray-700">
                  Consider extending the project timeline by 1 week to ensure quality
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Report generated on {format(new Date(), 'MMMM d, yyyy')}</p>
            <p className="mt-1">For internal use only. Confidential and proprietary.</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Helper function for export
function exportReport(format: string) {
  alert(`Exporting project report as ${format}...`);
  // Implement actual export logic
}