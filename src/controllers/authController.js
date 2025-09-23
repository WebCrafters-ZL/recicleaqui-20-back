import authService from '../services/authService.js';

export default {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const token = await authService.login(email, password);
            return res.status(200).json({ token });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }
};