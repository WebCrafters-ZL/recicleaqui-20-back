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
    },

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.register({ name, email, password });
            return res.status(201).json({ user });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    async me(req, res) {
        try {
            const user = await authService.getUserById(req.user.id);
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }
};