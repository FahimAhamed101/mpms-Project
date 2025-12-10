'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  UserPlus,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  type: 'task_completed' | 'task_created' | 'task_updated' | 'comment_added' | 'member_added';
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  project?: {
    title: string;
  };
}

interface RecentActivitiesProps {
  activities?: any[];
}

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  // Mock data if no activities provided
  const mockActivities: Activity[] = [
    {
      id: '1',
      title: 'Login page redesign completed',
      type: 'task_completed',
      user: { name: 'John Doe' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      project: { title: 'Website Redesign' },
    },
    {
      id: '2',
      title: 'API integration started',
      type: 'task_created',
      user: { name: 'Jane Smith' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      project: { title: 'Mobile App' },
    },
    {
      id: '3',
      title: 'Sarah Johnson joined the team',
      type: 'member_added',
      user: { name: 'Admin' },
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    {
      id: '4',
      title: 'Bug report submitted',
      type: 'comment_added',
      user: { name: 'Mike Wilson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      project: { title: 'Bug Fixes' },
    },
    {
      id: '5',
      title: 'Database migration delayed',
      type: 'task_updated',
      user: { name: 'Alex Brown' },
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      project: { title: 'Backend Upgrade' },
    },
  ];

  const displayActivities = activities || mockActivities;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return CheckCircle;
      case 'task_created':
        return FileText;
      case 'task_updated':
        return AlertCircle;
      case 'comment_added':
        return MessageSquare;
      case 'member_added':
        return UserPlus;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return 'text-green-600 bg-green-50';
      case 'task_created':
        return 'text-blue-600 bg-blue-50';
      case 'task_updated':
        return 'text-yellow-600 bg-yellow-50';
      case 'comment_added':
        return 'text-purple-600 bg-purple-50';
      case 'member_added':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'task_completed':
        return `${activity.user.name} completed "${activity.title}"`;
      case 'task_created':
        return `${activity.user.name} created "${activity.title}"`;
      case 'task_updated':
        return `${activity.user.name} updated "${activity.title}"`;
      case 'comment_added':
        return `${activity.user.name} commented on "${activity.title}"`;
      case 'member_added':
        return `${activity.user.name} added "${activity.title}" to the team`;
      default:
        return activity.title;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          View all
        </button>
      </div>
      <div className="space-y-6">
        {displayActivities.slice(0, 5).map((activity: any) => {
          const Icon = getActivityIcon(activity.type || 'task_updated');
          const colorClass = getActivityColor(activity.type || 'task_updated');
          
          return (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 ${colorClass} rounded-lg p-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {getActivityText(activity)}
                </p>
                {activity.project && (
                  <p className="text-xs text-gray-500 mt-1">
                    Project: {activity.project.title}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {displayActivities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activities</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;