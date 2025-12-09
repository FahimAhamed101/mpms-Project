import express from 'express';
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/team.controller';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER), getTeamMembers)
  .post(authorize(UserRole.ADMIN, UserRole.MANAGER), createTeamMember);

router
  .route('/:id')
  .put(authorize(UserRole.ADMIN, UserRole.MANAGER), updateTeamMember)
  .delete(authorize(UserRole.ADMIN), deleteTeamMember);

export default router;