import express from 'express';
import {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
} from '../controllers/sprint.controller';
import { protect, authorize } from '../middleware/auth';
import { validateSprint } from '../utils/validation';
import { UserRole } from '../types';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getSprints)
  .post(authorize(UserRole.ADMIN, UserRole.MANAGER), validateSprint, createSprint);

router
  .route('/:id')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getSprintById)
  .put(authorize(UserRole.ADMIN, UserRole.MANAGER), validateSprint, updateSprint)
  .delete(authorize(UserRole.ADMIN, UserRole.MANAGER), deleteSprint);

export default router;