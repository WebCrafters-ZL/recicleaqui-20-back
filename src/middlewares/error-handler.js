import logger from '../utils/logger.js'; 

export default function errorHandler(err, req, res, next) {
    // If headers were already sent, delegate to the default Express error handler
    if (res.headersSent) {
        return next(err);
    }
    // Log de erro centralizado e seguro
    logger.error(`Erro (${req.method} ${req.originalUrl}): ${err.message}`, {
        stack: err.stack,
        status: err.status || 500,
        user: req.user ? req.user.id : undefined // se você tiver usuário logado
    });

    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: req.app.get("env") === "development" ? err : {}
    });
}
