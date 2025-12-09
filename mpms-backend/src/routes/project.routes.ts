import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} from '../controllers/project.controller';
import { protect, authorize } from '../middleware/auth';
import { validateProject } from '../utils/validation';
import { UserRole } from '../types';

const router = express.Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getProjects)
  .post(authorize(UserRole.ADMIN, UserRole.MANAGER), validateProject, createProject);

router
  .route('/:id')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getProjectById)
  .put(authorize(UserRole.ADMIN, UserRole.MANAGER), validateProject, updateProject)
  .delete(authorize(UserRole.ADMIN, UserRole.MANAGER), deleteProject);

router
  .route('/:id/team')
  .post(authorize(UserRole.ADMIN, UserRole.MANAGER), addTeamMember)
  .delete(authorize(UserRole.ADMIN, UserRole.MANAGER), removeTeamMember);

export default router;