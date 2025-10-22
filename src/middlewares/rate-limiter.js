import rateLimit from 'express-rate-limit';

export default function apiLimiter(_req, _res) {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos.',
    });
}