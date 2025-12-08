import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { validateRegister, validateLogin } from '../utils/validation';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);

export default router;