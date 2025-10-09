import { authenticate } from "../services/auth.js";
import logger from "../utils/logger.js"; 

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        logger.info(`Tentativa de login para o email: ${email}`);
        const { user, token } = await authenticate(email, password);

        logger.info(`Login bem-sucedido para o usuário: ${email}`);
        return res.status(200).json({ user, token });

    } catch (error) {
        if (error.message === 'Usuário não encontrado') {
            logger.warn(`Usuário não encontrado na tentativa de login: ${req.body.email}`);
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Senha inválida') {
            logger.warn(`Senha inválida para o email: ${req.body.email}`);
            return res.status(401).json({ error: error.message });
        }
        logger.error(`Erro interno no login (${req.body.email}): ${error.message}`);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
