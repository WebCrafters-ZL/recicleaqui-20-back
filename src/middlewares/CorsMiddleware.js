import cors from 'cors';

/**
 * CorsConfig - Configuração de CORS para a aplicação
 */
class CorsConfig {
  /**
   * Retorna middleware CORS configurado
   */
  static getMiddleware(options = {}) {
    const corsOptions = {
      origin: options.origin || process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: options.credentials !== undefined ? options.credentials : true,
      ...options
    };
    return cors(corsOptions);
  }

  /**
   * CORS para múltiplas origens
   */
  static getMultiOriginMiddleware(allowedOrigins = []) {
    const corsOptions = {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    };
    return cors(corsOptions);
  }
}

// Export do middleware configurado para compatibilidade
export default CorsConfig.getMiddleware();

// Export da classe
export { CorsConfig };