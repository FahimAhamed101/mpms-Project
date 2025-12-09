import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  updateTaskStatus,
  logTime,
} from '../controllers/task.controller';
import { protect, authorize } from '../middleware/auth';
import { validateTask } from '../utils/validation';
import { UserRole } from '../types';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getTasks)
  .post(authorize(UserRole.ADMIN, UserRole.MANAGER), validateTask, createTask);

router
  .route('/:id')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getTaskById)
  .put(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), updateTask)
  .delete(authorize(UserRole.ADMIN, UserRole.MANAGER), deleteTask);

router.post('/:id/comments', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), addComment);
router.put('/:id/status', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), updateTaskStatus);
router.post('/:id/log-time', authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), logTime);

export default router;