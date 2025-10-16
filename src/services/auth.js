import { comparePassword, generateToken } from '../utils/hash-utils.js';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function authenticate(email, password) {
    try {
        const user = await prisma.User.findUnique({ where: { email } });
        if (!user) {
            logger.warn(`Tentativa de login falhou: usuário não encontrado (${email})`);
            throw new Error('Usuário não encontrado');
        }

        const validPassword = await comparePassword(password, user.password);
        if (!validPassword) {
            logger.warn(`Tentativa de login falhou: senha inválida (${email})`);
            throw new Error('Senha inválida');
        }

        const token = generateToken(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: userPassword, resetToken, resetTokenGeneratedAt, ...safeUser } = user;

        logger.info(`Usuário autenticado com sucesso: ${email}`);

        return { user: safeUser, token };
    } catch (error) {
        logger.error(`Erro na autenticação de usuário: ${email}`, { error: error.message });
        throw error;
    }
}

export { authenticate };
