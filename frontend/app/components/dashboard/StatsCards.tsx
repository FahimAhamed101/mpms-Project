'use client';

import {
  FolderOpen,
  CheckSquare,
  Users,
  CalendarDays,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface StatsCardsProps {
  stats?: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    totalUsers: number;
    totalSprints: number;
  };
  loading?: boolean;
}

const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  const cards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Projects',
      value: stats?.activeProjects || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Team Members',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Sprints',
      value: stats?.totalSprints || 0,
      icon: CalendarDays,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Overdue Tasks',
      value: 3, // This would come from API
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
            </div>
            <div className="mt-4 h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Updated just now</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;