/**
 * Validators - Utilitários para validação de dados
 */
class Validators {
  /**
   * Valida formato de email
   */
  static isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  /**
   * Remove todos os caracteres não numéricos
   */
  static onlyDigits(value) {
    return String(value).replace(/\D+/g, "");
  }

  /**
   * Valida CPF (algoritmo oficial)
   */
  static isValidCPF(cpf) {
    const s = Validators.onlyDigits(cpf);
    if (!/^[0-9]{11}$/.test(s)) return false;
    // rejeita CPFs óbvios (todos dígitos iguais)
    if (/^(\d)\1{10}$/.test(s)) return false;

    const calc = (digits) => {
      let sum = 0;
      // eslint-disable-next-line security/detect-object-injection -- digits is sanitized and comes from regex match
      for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * (digits.length + 1 - i);
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
   */
  static isValidCNPJ(cnpj) {
    const s = Validators.onlyDigits(cnpj);
    if (!/^[0-9]{14}$/.test(s)) return false;
    if (/^(\d)\1{13}$/.test(s)) return false;

    const calc = (digits, weights) => {
      let sum = 0;
      // eslint-disable-next-line security/detect-object-injection -- digits/weights derived from sanitized input
      for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * weights[i];
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
   * Valida telefone brasileiro (formato básico)
   */
  static isValidPhone(phone) {
    const s = Validators.onlyDigits(phone);
    return /^[0-9]{10,11}$/.test(s);
  }

  /**
   * Valida CEP brasileiro
   */
  static isValidCEP(cep) {
    const s = Validators.onlyDigits(cep);
    return /^[0-9]{8}$/.test(s);
  }

  /**
   * Valida se string é uma linha de material válida
   */
  static isValidMaterialLine(line) {
    const allowed = ['VERDE', 'MARROM', 'AZUL', 'BRANCA'];
    return allowed.includes(String(line).toUpperCase());
  }

  /**
   * Valida array de linhas (todas devem ser válidas)
   */
  static areValidMaterialLines(lines) {
    if (!Array.isArray(lines) || lines.length === 0) return false;
    return lines.every(l => Validators.isValidMaterialLine(l));
  }
}

// Exports nomeados para compatibilidade com código existente
export const isValidEmail = Validators.isValidEmail.bind(Validators);
export const isValidCPF = Validators.isValidCPF.bind(Validators);
export const isValidCNPJ = Validators.isValidCNPJ.bind(Validators);
export const onlyDigits = Validators.onlyDigits.bind(Validators);
export const isValidMaterialLine = Validators.isValidMaterialLine.bind(Validators);
export const areValidMaterialLines = Validators.areValidMaterialLines.bind(Validators);

// Export da classe
export default Validators;
