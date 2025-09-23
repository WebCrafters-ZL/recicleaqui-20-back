import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function authenticate(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        throw new Error('Senha inválida');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1d',
    });

    return { user, token };
}
