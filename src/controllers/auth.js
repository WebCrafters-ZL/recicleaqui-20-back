import { authenticate } from "../services/auth.js";

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { user, token } = await authenticate(email, password);
        return res.status(200).json({ user, token });
    } catch (error) {
        if (error.message === 'Usuário não encontrado') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Senha inválida') {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
