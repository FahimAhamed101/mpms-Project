// app/lib/utils/statusUtils.ts
import { ProjectStatus, TaskStatus } from '@/app/types';

/**
 * Convert backend project status string to ProjectStatus enum
 */
export function normalizeProjectStatus(status: string | undefined): ProjectStatus {
  if (!status) return ProjectStatus.PLANNED;
  
  const statusLower = status.toLowerCase().replace(/[_\s]/g, '-');
  
  const statusMap: Record<string, ProjectStatus> = {
    'planning': ProjectStatus.PLANNING,
    'planned': ProjectStatus.PLANNED,
    'active': ProjectStatus.ACTIVE,
    'on-hold': ProjectStatus.ON_HOLD,
    'in-progress': ProjectStatus.ACTIVE,
    'completed': ProjectStatus.COMPLETED,
    'cancelled': ProjectStatus.CANCELLED,
    'canceled': ProjectStatus.CANCELLED,
    'archived': ProjectStatus.ARCHIVED,
  };
  
  return statusMap[statusLower] || ProjectStatus.PLANNED;
}

/**
 * Convert backend task status string to TaskStatus enum
 */
export function normalizeTaskStatus(status: string | undefined): TaskStatus {
  if (!status) return TaskStatus.TODO;
  
  const statusLower = status.toLowerCase().replace(/[-\s]/g, '_');
  
  const statusMap: Record<string, TaskStatus> = {
    'todo': TaskStatus.TODO,
    'to_do': TaskStatus.TODO,
    'in_progress': TaskStatus.IN_PROGRESS,
    'inprogress': TaskStatus.IN_PROGRESS,
    'review': TaskStatus.REVIEW,
    'done': TaskStatus.DONE,
    'completed': TaskStatus.DONE,
  };
  
  return statusMap[statusLower] || TaskStatus.TODO;
}

/**
 * Format status for display
 */
export function formatStatusDisplay(status: ProjectStatus | TaskStatus | string): string {
  const str = status.toString();
  
  if (str.includes('-')) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  if (str.includes('_')) {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get status color classes
 */
export function getProjectStatusColor(status: ProjectStatus | string): {
  bg: string;
  text: string;
  badge: string;
} {
  const normalizedStatus = typeof status === 'string' 
    ? normalizeProjectStatus(status) 
    : status;
  
  const colorMap: Record<ProjectStatus, { bg: string; text: string; badge: string }> = {
    [ProjectStatus.PLANNING]: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      badge: 'bg-gray-100 text-gray-800',
    },
    [ProjectStatus.PLANNED]: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
    },
    [ProjectStatus.ACTIVE]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
    [ProjectStatus.ON_HOLD]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    [ProjectStatus.COMPLETED]: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      badge: 'bg-purple-100 text-purple-800',
    },
    [ProjectStatus.CANCELLED]: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
    },
    [ProjectStatus.ARCHIVED]: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-600',
    },
  };
  
  return colorMap[normalizedStatus] || colorMap[ProjectStatus.PLANNED];
}

export function getTaskStatusColor(status: TaskStatus | string): {
  bg: string;
  text: string;
  badge: string;
} {
  const normalizedStatus = typeof status === 'string' 
    ? normalizeTaskStatus(status) 
    : status;
  
  const colorMap: Record<TaskStatus, { bg: string; text: string; badge: string }> = {
    [TaskStatus.TODO]: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      badge: 'bg-gray-100 text-gray-800',
    },
    [TaskStatus.IN_PROGRESS]: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
    },
    [TaskStatus.REVIEW]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    [TaskStatus.DONE]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
  };
  
  return colorMap[normalizedStatus] || colorMap[TaskStatus.TODO];
}