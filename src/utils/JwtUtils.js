import jwt from 'jsonwebtoken';
import ConfigUtils from './ConfigUtils.js';

/**
 * JwtUtils - Utilitários para geração e validação de tokens JWT
 * Centraliza lógica de JWT usada em AuthService e AuthMiddleware
 */
class JwtUtils {
  /**
   * Gera um token JWT
   * @param {Object} payload - Dados a serem incluídos no token
   * @param {Object} options - Opções adicionais (expiresIn, etc.)
   * @returns {string} Token JWT
   */
  static generate(payload, options = {}) {
    const secret = ConfigUtils.JWT_SECRET;
    const defaultOptions = {
      expiresIn: ConfigUtils.JWT_EXPIRES_IN
    };
    
    return jwt.sign(payload, secret, { ...defaultOptions, ...options });
  }

  /**
   * Verifica e decodifica um token JWT
   * @param {string} token - Token a ser verificado
   * @returns {Object} Payload decodificado
   * @throws {Error} Se o token for inválido ou expirado
   */
  static verify(token) {
    const secret = ConfigUtils.JWT_SECRET;
    return jwt.verify(token, secret);
  }

  /**
   * Decodifica um token sem verificar (não recomendado para autenticação)
   * @param {string} token - Token a ser decodificado
   * @returns {Object|null} Payload decodificado ou null
   */
  static decode(token) {
    return jwt.decode(token);
  }

  /**
   * Extrai token do header Authorization
   * @param {string} authHeader - Header Authorization (Bearer token)
   * @returns {string|null} Token extraído ou null
   */
  static extractFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  /**
   * Verifica se um token está expirado sem lançar erro
   * @param {string} token - Token a ser verificado
   * @returns {boolean} true se expirado
   */
  static isExpired(token) {
    try {
      this.verify(token);
      return false;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return true;
      }
      throw error;
    }
  }

  /**
   * Gera token de autenticação para usuário
   * @param {Object} user - Dados do usuário (id, email, role)
   * @param {string} expiresIn - Tempo de expiração (default: 1d)
   * @returns {string} Token JWT
   */
  static generateAuthToken(user, expiresIn = null) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    const options = expiresIn ? { expiresIn } : {};
    return this.generate(payload, options);
  }
}

// Exports nomeados para compatibilidade
export const generateToken = JwtUtils.generate.bind(JwtUtils);
export const verifyToken = JwtUtils.verify.bind(JwtUtils);
export const decodeToken = JwtUtils.decode.bind(JwtUtils);
export const extractTokenFromHeader = JwtUtils.extractFromHeader.bind(JwtUtils);

export default JwtUtils;
