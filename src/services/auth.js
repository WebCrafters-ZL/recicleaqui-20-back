import { comparePassword, generateToken } from '../utils/hash-utils.js';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function authenticate(email, password) {
    const user = await prisma.User.findUnique({ where: { email } });
    if (!user) {
        logger.warn(`Tentativa de login falhou: usuário não encontrado (${email})`);
        throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
        logger.warn(`Tentativa de login falhou: senha inválida (${email})`);
        throw Object.assign(new Error('Senha inválida'), { status: 401 });
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
        const client = await prisma.Client.findUnique({
            where: { userId: user.id },
            select: { id: true, type: true }
        });
        if (client) {
            clientInfo = { clientId: client.id, clientType: client.type };
        }
    }

    logger.info(`Usuário autenticado com sucesso: ${email} (role: ${user.role})`);

    return { user: safeUser, token, ...clientInfo };
}

export { authenticate };
