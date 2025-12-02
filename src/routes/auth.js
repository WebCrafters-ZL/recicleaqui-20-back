import { Router } from 'express';
import apiLimiter from '../middlewares/RateLimiterMiddleware.js';
import prisma from '../config/DatabaseManager.js';

// Importar classes
import AuthRepository from '../repositories/AuthRepository.js';
import AuthService from '../services/AuthService.js';
import AuthController from '../controllers/AuthController.js';

// Instanciar dependências
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router = Router();

// Helper para async handlers
const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/login', apiLimiter, asyncHandler(authController.login));
router.post('/forgot-password', apiLimiter, asyncHandler(authController.forgotPassword));
router.post('/reset-password', apiLimiter, asyncHandler(authController.resetPassword));
router.post('/verify-reset-code', apiLimiter, asyncHandler(authController.verifyResetCode));

export default router;
