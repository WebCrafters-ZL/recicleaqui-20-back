import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import ConfigUtils from './ConfigUtils.js';

/**
 * Logger - Gerencia logs da aplicação usando Winston
 */
class Logger {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'recicleaqui-backend';
    this.level = options.level || 'info';
    this.logger = this.createLogger();
  }

  /**
   * Cria instância do logger Winston
   */
  createLogger() {
    const logger = createLogger({
      level: this.level,
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: this.serviceName },
      transports: this.createTransports()
    });

    if (!ConfigUtils.isProduction) {
      logger.add(new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      }));
    }

    return logger;
  }

  /**
   * Cria transportes para os logs
   */
  createTransports() {
    return [
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '14d'
      }),
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d'
      })
    ];
  }

  /**
   * Log de nível info
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  /**
   * Log de nível error
   */
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  /**
   * Log de nível warn
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  /**
   * Log de nível debug
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  /**
   * Cria logger personalizado
   */
  static create(options) {
    return new Logger(options);
  }
}

// Instância singleton para compatibilidade
const loggerInstance = new Logger();

// Export do objeto logger (compatibilidade)
export default loggerInstance;

// Export da classe
export { Logger };
