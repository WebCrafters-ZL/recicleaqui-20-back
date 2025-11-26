import { REGEX } from '../Constants.js';

/**
 * EmailValidator - Valida endereços de email
 */
class EmailValidator {
  /**
   * Valida formato de email
   * @param {string} email - Email a ser validado
   * @returns {boolean} true se válido
   */
  static isValid(email) {
    return REGEX.EMAIL.test(String(email).toLowerCase());
  }

  /**
   * Normaliza email (lowercase, trim)
   * @param {string} email - Email a ser normalizado
   * @returns {string} Email normalizado
   */
  static normalize(email) {
    return String(email).toLowerCase().trim();
  }
}

export default EmailValidator;
