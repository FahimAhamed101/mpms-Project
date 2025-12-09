import express from 'express';
import {
  getProjectProgress,
  getUserWorkload,
  getSprintReports,
  getDashboardStats,
} from '../controllers/report.controller';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getDashboardStats);
router.get('/project/:projectId', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getProjectProgress);
router.get('/user/:userId', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getUserWorkload);
router.get('/sprint/:sprintId', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getSprintReports);

export default router;