import express from 'express';
import * as authController from '../../controllers/authController.js';

const router = express.Router();

// Rota de registro de usuário
router.post('/register', authController.register);

// Rota de login de usuário
router.post('/login', authController.login);

// Rota para verificar autenticação (exemplo de rota protegida)
router.get('/me', authController.authenticate, authController.getProfile);

export default router;