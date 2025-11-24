import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

/**
 * HashUtils - Utilitários para hashing de senhas e geração de tokens
 */
class HashUtils {
  /**
   * Número de rounds para o salt do bcrypt
   */
  static SALT_ROUNDS = 10;

  /**
   * Gera hash de uma senha
   */
  static async hashPassword(password, saltRounds = HashUtils.SALT_ROUNDS) {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compara senha em texto plano com hash
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Gera token JWT
   */
  static async generateToken(payload, secret, options = {}) {
    return jwt.sign(payload, secret, options);
  }

  /**
   * Verifica e decodifica token JWT
   */
  static async verifyToken(token, secret) {
    return jwt.verify(token, secret);
  }
}

// Exports nomeados para compatibilidade com código existente
export const hashPassword = HashUtils.hashPassword.bind(HashUtils);
export const comparePassword = HashUtils.comparePassword.bind(HashUtils);
export const generateToken = HashUtils.generateToken.bind(HashUtils);

// Export da classe
export default HashUtils;