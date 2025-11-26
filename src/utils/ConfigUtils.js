/**
 * ConfigUtils - Centraliza leitura de variáveis de ambiente
 * Evita repetição de process.env.* || default em múltiplos arquivos
 */
class ConfigUtils {
  /**
   * Configurações de JWT
   */
  static get JWT_SECRET() {
    return process.env.JWT_SECRET || 'your_jwt_secret';
  }

  static get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || '1d';
  }

  /**
   * Configurações de Email/SMTP
   */
  static get SMTP_HOST() {
    return process.env.SMTP_HOST;
  }

  static get SMTP_PORT() {
    return parseInt(process.env.SMTP_PORT || '587', 10);
  }

  static get SMTP_USER() {
    return process.env.SMTP_USER;
  }

  static get SMTP_PASS() {
    return process.env.SMTP_PASS;
  }

  static get EMAIL_FROM() {
    return process.env.EMAIL_FROM || 'no-reply@example.com';
  }

  static get USE_ETHEREAL() {
    return process.env.USE_ETHEREAL === 'true';
  }

  /**
   * Configurações de Frontend URLs
   */
  static get FRONTEND_URL() {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  static get FRONTEND_URL_WEB() {
    return process.env.FRONTEND_URL_WEB || process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  static get FRONTEND_URL_DEEP() {
    return process.env.FRONTEND_URL_DEEP;
  }

  /**
   * Configurações gerais
   */
  static get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  }

  static get isDevelopment() {
    return this.NODE_ENV === 'development';
  }

  static get isProduction() {
    return this.NODE_ENV === 'production';
  }

  /**
   * Retorna uma variável de ambiente ou valor padrão
   * @param {string} key - Nome da variável
   * @param {string} defaultValue - Valor padrão
   */
  static get(key, defaultValue = null) {
    // eslint-disable-next-line security/detect-object-injection -- key is controlled by application code
    return process.env[key] || defaultValue;
  }

  /**
   * Retorna uma variável de ambiente como número
   * @param {string} key - Nome da variável
   * @param {number} defaultValue - Valor padrão
   */
  static getNumber(key, defaultValue = 0) {
    // eslint-disable-next-line security/detect-object-injection -- key is controlled by application code
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  /**
   * Retorna uma variável de ambiente como booleano
   * @param {string} key - Nome da variável
   * @param {boolean} defaultValue - Valor padrão
   */
  static getBoolean(key, defaultValue = false) {
    // eslint-disable-next-line security/detect-object-injection -- key is controlled by application code
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }
}

export default ConfigUtils;
