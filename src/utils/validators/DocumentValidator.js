import { REGEX } from '../Constants.js';

/**
 * DocumentValidator - Valida CPF e CNPJ
 */
class DocumentValidator {
  /**
   * Remove todos os caracteres não numéricos
   * @param {string} value - Valor a ser limpo
   * @returns {string} Apenas dígitos
   */
  static onlyDigits(value) {
    return String(value).replace(REGEX.ONLY_DIGITS, "");
  }

  /**
   * Valida CPF (algoritmo oficial)
   * @param {string} cpf - CPF a ser validado
   * @returns {boolean} true se válido
   */
  static isValidCPF(cpf) {
    const s = this.onlyDigits(cpf);
    if (!REGEX.CPF.test(s)) return false;
    
    // Rejeita CPFs com todos dígitos iguais
    if (REGEX.REPEATED_DIGITS.test(s)) return false;

    const calc = (digits) => {
      let sum = 0;
      for (let i = 0; i < digits.length; i++) {
        // eslint-disable-next-line security/detect-object-injection -- i is controlled by loop
        sum += Number(digits[i]) * (digits.length + 1 - i);
      }
      const mod = (sum * 10) % 11;
      return mod === 10 ? 0 : mod;
    };

    const base = s.slice(0, 9);
    const d1 = calc(base);
    const d2 = calc(base + d1);
    return s === base + String(d1) + String(d2);
  }

  /**
   * Valida CNPJ (algoritmo oficial)
   * @param {string} cnpj - CNPJ a ser validado
   * @returns {boolean} true se válido
   */
  static isValidCNPJ(cnpj) {
    const s = this.onlyDigits(cnpj);
    if (!REGEX.CNPJ.test(s)) return false;
    
    // Rejeita CNPJs com todos dígitos iguais
    if (REGEX.REPEATED_DIGITS.test(s)) return false;

    const calc = (digits, weights) => {
      let sum = 0;
      for (let i = 0; i < digits.length; i++) {
        // eslint-disable-next-line security/detect-object-injection -- i is controlled by loop
        sum += Number(digits[i]) * weights[i];
      }
      const r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    };

    const base = s.slice(0, 12);
    const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
    const d1 = calc(base, weights1);
    const weights2 = [6].concat(weights1);
    const d2 = calc(base + d1, weights2);
    return s === base + String(d1) + String(d2);
  }

  /**
   * Valida CEP brasileiro
   * @param {string} cep - CEP a ser validado
   * @returns {boolean} true se válido
   */
  static isValidCEP(cep) {
    const s = this.onlyDigits(cep);
    return REGEX.CEP.test(s);
  }
}

export default DocumentValidator;
