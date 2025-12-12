// app/types/index.ts

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  CLIENT = 'client',
}

// Updated to match backend values
export enum ProjectStatus {
  PLANNING = 'planning',
  PLANNED = 'planned',
  ACTIVE = 'active',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  skills?: string[];
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  skills?: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    skills?: string[];
    avatar?: string;
  };
}

export interface ValidationError {
  path: string;
  msg: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignees: User[];
  dueDate: string;
  sprint?: string;
  project: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  project: {
    _id: string;
    title: string;
  };
  assignees: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  estimatedHours: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  tags: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  _id: string;
  title: string;
  sprintNumber: number;
  project: string;
  startDate: string;
  endDate: string;
  goal?: string;
  progress: number;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus | string; // Can be string from backend
  progress: number;
  team: (User | string)[]; // Can be populated User objects or just IDs
  client?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  thumbnail?: string;
  manager?: User | string; // Can be populated User object or just ID
  stats?: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
  createdAt?: string;
  updatedAt?: string;
}