import { body } from 'express-validator';
import { UserRole, TaskPriority, ProjectStatus, TaskStatus } from '../types';

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateProject = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('client').trim().notEmpty().withMessage('Client name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('status').optional().isIn(Object.values(ProjectStatus)).withMessage('Invalid project status'),
  body('manager').optional().isMongoId().withMessage('Valid manager ID is required'),
];

export const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('sprint').isMongoId().withMessage('Valid sprint ID is required'),
  body('estimatedHours').isFloat({ min: 0 }).withMessage('Estimated hours must be a positive number'),
  body('priority').optional().isIn(Object.values(TaskPriority)).withMessage('Invalid priority'),
  body('status').optional().isIn(Object.values(TaskStatus)).withMessage('Invalid status'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
];

export const validateSprint = [
  body('title').trim().notEmpty().withMessage('Sprint title is required'),
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
];