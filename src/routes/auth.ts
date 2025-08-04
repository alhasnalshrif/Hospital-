import { Router } from 'express';
import { login, register, logout, changePassword, getProfile } from '../controllers/auth';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { authValidation } from '../utils/validation';

const router = Router();

// Public routes
router.post('/login', validateRequest(authValidation.login), login);
router.post('/register', validateRequest(authValidation.register), register);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/change-password', authenticateToken, validateRequest(authValidation.changePassword), changePassword);
router.get('/profile', authenticateToken, getProfile);

export default router;