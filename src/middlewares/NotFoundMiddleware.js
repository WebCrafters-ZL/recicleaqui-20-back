import createError from 'http-errors';

/**
 * NotFoundMiddleware - Trata rotas não encontradas
 */
class NotFoundMiddleware {
  /**
   * Middleware que retorna erro 404 para rotas não encontradas
   */
  static handle(_req, _res, next) {
    next(createError(404));
  }

  /**
   * Retorna erro 404 customizado com mensagem
   */
  static handleWithMessage(message = 'Rota não encontrada') {
    return (_req, _res, next) => {
      next(createError(404, message));
    };
  }
}

// Export da função para compatibilidade
export default NotFoundMiddleware.handle;

// Export da classe
export { NotFoundMiddleware };