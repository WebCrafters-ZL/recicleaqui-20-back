import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import logger from 'morgan';
import path from 'node:path';
import notFound from './middlewares/NotFoundMiddleware.js';
import errorHandler from './middlewares/ErrorHandlerMiddleware.js';
import corsConfig from './middlewares/CorsMiddleware.js';
import apiLimiter from './middlewares/RateLimiterMiddleware.js';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/client.js';
import collectorRoutes from './routes/collector.js';
import discardRoutes from './routes/discard.js';

/**
 * Application - Classe principal da aplicação Express
 */
class Application {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  /**
   * Configura middlewares globais
   */
  setupMiddlewares() {
    // Configura trust proxy antes de middlewares que dependem de IP (ex: rate limit)
    // Em produção pode ser ajustado via variável TRUST_PROXY (ex: 'loopback', '127.0.0.1', quantidade de hops, etc.)
    const envTrustProxy = process.env.TRUST_PROXY;
    if (envTrustProxy !== undefined && envTrustProxy !== '') {
      this.app.set('trust proxy', envTrustProxy === 'true' ? true : envTrustProxy);
    } else {
      // Padrão seguro: um hop (ex: reverse proxy local / dev container)
      this.app.set('trust proxy', 1);
    }
    this.app.use(corsConfig);
    this.app.use(apiLimiter);
    this.app.use(helmet());
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(process.cwd(), 'public'))); // Serve public files
    // Servir arquivos estáticos de uploads com cache control
    this.app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
      etag: true,
      maxAge: '7d',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      }
    }));
  }

  /**
   * Configura rotas da API
   */
  setupRoutes() {
    // Rotas API v1
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/clients', clientRoutes);
    this.app.use('/api/v1/collectors', collectorRoutes);
    this.app.use('/api/v1/discards', discardRoutes);
  }

  /**
   * Configura handlers de erro
   */
  setupErrorHandlers() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  /**
   * Adiciona rota customizada
   */
  addRoute(path, router) {
    this.app.use(path, router);
  }

  /**
   * Adiciona middleware customizado
   */
  addMiddleware(middleware) {
    this.app.use(middleware);
  }

  /**
   * Obtém instância do Express app
   */
  getExpressApp() {
    return this.app;
  }

  /**
   * Define configuração
   */
  set(key, value) {
    this.app.set(key, value);
  }

  /**
   * Obtém configuração
   */
  get(key) {
    return this.app.get(key);
  }
}

// Cria instância da aplicação
const application = new Application();
const app = application.getExpressApp();

// Export para compatibilidade
export default app;

// Export da classe
export { Application };
