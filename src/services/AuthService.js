import { comparePassword, generateToken } from '../utils/HashUtils.js';
import logger from '../utils/Logger.js';
import BaseService from '../core/BaseService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * AuthService - Gerencia autenticação de usuários
 */
export default class AuthService extends BaseService {
    constructor(authRepository) {
        super();
        this.authRepo = authRepository;
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
}
