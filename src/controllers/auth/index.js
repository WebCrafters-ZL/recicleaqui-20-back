import { authenticate } from "../../services/auth/index.js";

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const { usuario, token } = await authenticate(email, password);
        return res.status(200).json({ usuario, token });
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
}
