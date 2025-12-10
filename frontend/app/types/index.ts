// Add these to your existing types

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
// app/types.ts
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  CLIENT = 'client' // if you have this
}
export interface ValidationError {
  path: string;
  msg: string;
}