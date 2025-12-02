import bcrypt from "bcryptjs";
import { SECURITY } from './Constants.js';

/**
 * HashUtils - Utilitários para hashing de senhas
 */
class HashUtils {
  /**
   * Número de rounds para o salt do bcrypt
   */
  static get SALT_ROUNDS() {
    return SECURITY.SALT_ROUNDS;
  }

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
}

// Exports nomeados para compatibilidade com código existente
export const hashPassword = HashUtils.hashPassword.bind(HashUtils);
export const comparePassword = HashUtils.comparePassword.bind(HashUtils);

// Export da classe
export default HashUtils;