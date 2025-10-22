import cors from 'cors';

export default function corsOptions(_req, _res) {
    return cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    });
}