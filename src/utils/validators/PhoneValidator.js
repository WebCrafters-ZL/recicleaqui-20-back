import { REGEX } from '../Constants.js';

/**
 * PhoneValidator - Valida telefones brasileiros
 */
class PhoneValidator {
  /**
   * Remove todos os caracteres não numéricos
   * @param {string} value - Valor a ser limpo
   * @returns {string} Apenas dígitos
   */
  static onlyDigits(value) {
    return String(value).replace(REGEX.ONLY_DIGITS, "");
  }

  /**
   * Valida telefone brasileiro (formato básico)
   * @param {string} phone - Telefone a ser validado
   * @returns {boolean} true se válido (10 ou 11 dígitos)
   */
  static isValid(phone) {
    const s = this.onlyDigits(phone);
    return REGEX.PHONE.test(s);
  }

  /**
   * Verifica se é celular (11 dígitos)
   * @param {string} phone - Telefone a ser validado
   * @returns {boolean} true se for celular
   */
  static isMobile(phone) {
    const s = this.onlyDigits(phone);
    return s.length === 11;
  }

  /**
   * Verifica se é telefone fixo (10 dígitos)
   * @param {string} phone - Telefone a ser validado
   * @returns {boolean} true se for fixo
   */
  static isLandline(phone) {
    const s = this.onlyDigits(phone);
    return s.length === 10;
  }
}

export default PhoneValidator;
