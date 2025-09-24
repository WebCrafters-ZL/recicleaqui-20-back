import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function authenticate(email, password) {
    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) {
        throw new Error('Usuário não encontrado');
    }

    const validPassword = await bcrypt.compare(password, usuario.senha);
    if (!validPassword) {
        throw new Error('Senha inválida');
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, {
        expiresIn: '1d',
    });

    return { usuario, token };
}

export { authenticate };
