import logger from '../utils/Logger.js';

/**
 * ErrorHandlerMiddleware - Gerencia erros da aplicação
 */
class ErrorHandlerMiddleware {
  constructor(loggerInstance = logger) {
    this.logger = loggerInstance;
  }

  /**
   * Middleware principal de tratamento de erros
   */
  handle(err, req, res, next) {
    // If headers were already sent, delegate to the default Express error handler
    if (res.headersSent) {
      return next(err);
    }

    // Log de erro centralizado e seguro
    this.logger.error(`Erro (${req.method} ${req.originalUrl}): ${err.message}`, {
      stack: err.stack,
      status: err.status || 500,
      user: req.user ? req.user.id : undefined
    });

    const isDevelopment = req.app.get('env') === 'development';
    
    res.locals.message = err.message;
    res.locals.error = isDevelopment ? err : {};
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: isDevelopment ? err : {}
    });
  }

  /**
   * Método estático para uso direto
   */
  static createHandler(loggerInstance) {
    const handler = new ErrorHandlerMiddleware(loggerInstance);
    return handler.handle;
  }
}

// Instância singleton para compatibilidade
const errorHandlerInstance = new ErrorHandlerMiddleware();

// Export da função para compatibilidade
export default errorHandlerInstance.handle;

// Export da classe
export { ErrorHandlerMiddleware };
