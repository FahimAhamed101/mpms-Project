'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ProjectProgress = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock data for project progress
  const projectData = [
    { name: 'Website Redesign', progress: 85, completed: 42, total: 50, deadline: '2024-01-15' },
    { name: 'Mobile App', progress: 65, completed: 26, total: 40, deadline: '2024-01-30' },
    { name: 'Backend API', progress: 45, completed: 18, total: 40, deadline: '2024-02-10' },
    { name: 'UI/UX Design', progress: 90, completed: 45, total: 50, deadline: '2024-01-05' },
    { name: 'Testing Phase', progress: 30, completed: 12, total: 40, deadline: '2024-02-20' },
    { name: 'Documentation', progress: 55, completed: 22, total: 40, deadline: '2024-01-25' },
  ];

  // Task status distribution
  const taskStatusData = [
    { name: 'To Do', value: 35, color: '#9CA3AF' },
    { name: 'In Progress', value: 28, color: '#3B82F6' },
    { name: 'Review', value: 18, color: '#F59E0B' },
    { name: 'Done', value: 42, color: '#10B981' },
  ];

  // Timeline data
  const timelineData = [
    { week: 'Week 1', tasks: 12, completed: 8 },
    { week: 'Week 2', tasks: 15, completed: 10 },
    { week: 'Week 3', tasks: 18, completed: 12 },
    { week: 'Week 4', tasks: 20, completed: 15 },
    { week: 'Week 5', tasks: 22, completed: 18 },
    { week: 'Week 6', tasks: 25, completed: 22 },
    { week: 'Week 7', tasks: 28, completed: 25 },
  ];

  const COLORS = ['#9CA3AF', '#3B82F6', '#F59E0B', '#10B981'];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateAverageProgress = () => {
    const total = projectData.reduce((sum, project) => sum + project.progress, 0);
    return Math.round(total / projectData.length);
  };

  const averageProgress = calculateAverageProgress();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
          <p className="text-sm text-gray-600">Overview of all active projects</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{averageProgress}% average</span>
          </div>
          <div className="flex border border-gray-300 rounded-lg">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium capitalize ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${range === 'week' ? 'rounded-l-lg' : ''} ${
                  range === 'quarter' ? 'rounded-r-lg' : ''
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bars for each project */}
      <div className="space-y-4 mb-8">
        {projectData.map((project) => (
          <div key={project.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">{project.name}</span>
                <span className="text-xs text-gray-500">
                  {project.completed}/{project.total} tasks
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-900">
                  {project.progress}%
                </span>
                {project.progress >= 80 ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : project.progress >= 60 ? (
                  <ChevronUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Deadline: {project.deadline}</span>
              <span>{project.progress >= 80 ? 'Ahead' : project.progress >= 60 ? 'On Track' : 'Behind'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Task Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
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

        {/* Progress Timeline */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Progress Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  name="Total Tasks"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {timelineData[timelineData.length - 1].completed}
              </p>
              <p className="text-xs text-gray-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (timelineData[timelineData.length - 1].completed /
                    timelineData[timelineData.length - 1].tasks) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-gray-600">Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">7</p>
              <p className="text-xs text-gray-600">Weeks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">On Track</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">Projects meeting deadlines</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">At Risk</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-2">Need attention</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">Finished this month</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">248</p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-xs text-gray-600 mt-2">Logged this week</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;