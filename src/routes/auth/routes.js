import express from 'express';
import * as authController from '../../controllers/authController.js';
import apiLimiter from '../../middlewares/rateLimiter.js';

const router = express.Router();

// Rota de login de usuário
router.post('/login', apiLimiter, authController.login);

export default router;