import crypto from 'crypto';
import { comparePassword, generateToken, hashPassword } from '../utils/HashUtils.js';
import logger from '../utils/Logger.js';
import BaseService from '../core/BaseService.js';
import EmailService from './EmailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * AuthService - Gerencia autenticação de usuários
 */
export default class AuthService extends BaseService {
    constructor(authRepository) {
        super();
        this.authRepo = authRepository;
        this.emailService = new EmailService();
    }

    async authenticate(email, password) {
        const user = await this.authRepo.findUserByEmail(email);
        if (!user) {
            logger.warn(`Tentativa de login falhou: usuário não encontrado (${email})`);
            throw this.createError('Usuário não encontrado', 404);
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            logger.warn(`Tentativa de login falhou: senha inválida (${email})`);
            throw this.createError('Senha inválida', 401);
        }

        const token = await generateToken(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const safeUser = { ...user };
        delete safeUser.password;
        delete safeUser.resetToken;
        delete safeUser.resetTokenGeneratedAt;

        let clientInfo = null;
        if (user.role === 'CLIENT') {
            const client = await this.authRepo.findClientByUserId(user.id);
            if (client) {
                clientInfo = { clientId: client.id, clientType: client.type };
            }
        }

        logger.info(`Usuário autenticado com sucesso: ${email} (role: ${user.role})`);

        return { user: safeUser, token, ...clientInfo };
    }

    /**
     * Inicia fluxo de recuperação de senha
     */
    async requestPasswordReset(email) {
        const user = await this.authRepo.findUserByEmail(email);
        if (!user) {
            logger.warn(`Recuperação de senha: usuário não encontrado (${email})`);
            // Não revelar existência do usuário
            return { message: 'Se o email existir, enviaremos instruções.' };
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const generatedAt = new Date();

        await this.authRepo.updateResetToken(user.id, rawToken, generatedAt);
        logger.info(`Token de reset gerado para usuário ${email}`);

        // Links (web + deep) para múltiplos ambientes
        const webBase = process.env.FRONTEND_URL_WEB || process.env.FRONTEND_URL || 'http://localhost:3000';
        const deepBase = process.env.FRONTEND_URL_DEEP; // opcional
        const path = 'reset-password';
        const webLink = `${webBase.replace(/\/$/, '')}/${path}?token=${rawToken}`;
        const deepLink = deepBase ? `${deepBase}${path}?token=${rawToken}` : null;

        // Envia email
        try {
            await this.emailService.sendPasswordResetEmail(user.email, { webLink, deepLink });
            logger.info(`Email de recuperação enviado para ${email}`);
        } catch (err) {
            logger.error(`Falha ao enviar email de recuperação para ${email}: ${err.message}`);
            throw this.createError('Erro ao enviar email de recuperação', 500);
        }

        return { message: 'Se o email existir, enviaremos instruções.' };
    }

    /**
     * Finaliza fluxo de recuperação de senha definindo nova senha
     */
    async resetPassword(token, newPassword) {
        if (!token) {
            throw this.createError('Token obrigatório', 400);
        }
        if (!newPassword || newPassword.length < 6) {
            throw this.createError('Senha deve ter ao menos 6 caracteres', 400);
        }

        const user = await this.authRepo.findUserByResetToken(token);
        if (!user) {
            logger.warn(`Reset de senha: token inválido`);
            throw this.createError('Token inválido ou expirado', 400);
        }

        // Verifica expiração (1 hora)
        const generatedAt = user.resetTokenGeneratedAt;
        if (!generatedAt) {
            throw this.createError('Token inválido ou expirado', 400);
        }
        const now = Date.now();
        const ageMs = now - new Date(generatedAt).getTime();
        const oneHourMs = 60 * 60 * 1000;
        if (ageMs > oneHourMs) {
            logger.warn(`Reset de senha expirado para usuário ${user.email}`);
            throw this.createError('Token inválido ou expirado', 400);
        }

        const hashed = await hashPassword(newPassword);
        await this.authRepo.updatePasswordAndClearReset(user.id, hashed);
        logger.info(`Senha redefinida para usuário ${user.email}`);

        return { message: 'Senha atualizada com sucesso.' };
    }
}
