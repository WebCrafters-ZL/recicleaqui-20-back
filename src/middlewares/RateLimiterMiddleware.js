import rateLimit from 'express-rate-limit';

/**
 * RateLimiterMiddleware - Gerencia rate limiting para diferentes contextos
 */
class RateLimiterMiddleware {
  /**
   * Rate limiter padrão para API
   */
  static api(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
      max: options.max || 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: options.message || 'Muitas requisições deste IP, por favor tente novamente após 15 minutos.',
      ...options
    });
  }

  /**
   * Rate limiter mais restritivo para autenticação
   */
  static auth(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
      max: options.max || 5, // apenas 5 tentativas de login
      standardHeaders: true,
      legacyHeaders: false,
      message: options.message || 'Muitas tentativas de login. Tente novamente mais tarde.',
      ...options
    });
  }

  /**
   * Rate limiter para criação de recursos
   */
  static creation(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 60 * 60 * 1000, // 1 hour
      max: options.max || 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: options.message || 'Limite de criação atingido. Tente novamente mais tarde.',
      ...options
    });
  }
}

// Instância padrão para compatibilidade
const apiLimiter = RateLimiterMiddleware.api();

export default apiLimiter;
export { RateLimiterMiddleware };