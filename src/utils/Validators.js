import EmailValidator from './validators/EmailValidator.js';
import DocumentValidator from './validators/DocumentValidator.js';
import PhoneValidator from './validators/PhoneValidator.js';
import MaterialValidator from './validators/MaterialValidator.js';

/**
 * Validators - Utilitários para validação de dados
 * Agora usa módulos especializados para melhor organização
 */
class Validators {
  /**
   * Valida formato de email
   */
  static isValidEmail(email) {
    return EmailValidator.isValid(email);
  }

  /**
   * Remove todos os caracteres não numéricos
   */
  static onlyDigits(value) {
    return DocumentValidator.onlyDigits(value);
  }

  /**
   * Valida CPF (algoritmo oficial)
   */
  static isValidCPF(cpf) {
    return DocumentValidator.isValidCPF(cpf);
  }

  /**
   * Valida CNPJ (algoritmo oficial)
   */
  static isValidCNPJ(cnpj) {
    return DocumentValidator.isValidCNPJ(cnpj);
  }

  /**
   * Valida telefone brasileiro (formato básico)
   */
  static isValidPhone(phone) {
    return PhoneValidator.isValid(phone);
  }

  /**
   * Valida CEP brasileiro
   */
  static isValidCEP(cep) {
    return DocumentValidator.isValidCEP(cep);
  }

  /**
   * Valida se string é uma linha de material válida
   */
  static isValidMaterialLine(line) {
    return MaterialValidator.isValidLine(line);
  }

  /**
   * Valida array de linhas (todas devem ser válidas)
   */
  static areValidMaterialLines(lines) {
    return MaterialValidator.areValidLines(lines);
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
