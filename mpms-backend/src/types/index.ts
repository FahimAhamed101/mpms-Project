import mongoose from "mongoose";

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ProjectStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface IUser {
  _id?: mongoose.Types.ObjectId | string;  // Make it optional and allow ObjectId
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  skills?: string[];
  avatar?: string;
  isActive: boolean;
  createdAt?: Date;  // Make these optional too
  updatedAt?: Date;
}

export interface IProject {
   _id?: mongoose.Types.ObjectId | string; 
  title: string;
  client: string;
  description: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: ProjectStatus;
  thumbnail?: string;
  manager: string | IUser;
  team: (string | IUser)[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISprint {
  _id: string;
  title: string;
  sprintNumber: number;
  project: string | IProject;
  startDate: Date;
  endDate: Date;
  goal?: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  project: string | IProject;
  sprint: string | ISprint;
  assignees: (string | IUser)[];
  estimatedHours: number;
  actualHours: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  attachments: string[];
  subtasks: ISubtask[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ISubtask {
  title: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IComment {
  _id: string;
  task: string | ITask;
  user: string | IUser;
  content: string;
  parentComment?: string | IComment;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog {
  _id: string;
  user: string | IUser;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  createdAt: Date;
}