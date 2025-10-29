import { authenticate } from "../services/auth.js";
import logger from "../utils/logger.js";

export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        throw Object.assign(new Error("Campos obrigatórios ausentes"), { status: 400 });
    }

    logger.info(`Tentativa de login para o email: ${email}`);
    const { user, token } = await authenticate(email, password);

    logger.info(`Login bem-sucedido para o usuário: ${email}`);
    return res.status(200).json({ user, token });
}
