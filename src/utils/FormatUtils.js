import DocumentValidator from './validators/DocumentValidator.js';
import PhoneValidator from './validators/PhoneValidator.js';

/**
 * FormatUtils - Utilitários para formatação de dados
 * Formata CPF, CNPJ, telefone, CEP para exibição
 */
class FormatUtils {
  /**
   * Formata CPF (000.000.000-00)
   * @param {string} cpf - CPF a ser formatado
   * @returns {string} CPF formatado
   */
  static formatCPF(cpf) {
    const digits = DocumentValidator.onlyDigits(cpf);
    if (digits.length !== 11) return cpf;
    
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ (00.000.000/0000-00)
   * @param {string} cnpj - CNPJ a ser formatado
   * @returns {string} CNPJ formatado
   */
  static formatCNPJ(cnpj) {
    const digits = DocumentValidator.onlyDigits(cnpj);
    if (digits.length !== 14) return cnpj;
    
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata telefone ((00) 0000-0000 ou (00) 00000-0000)
   * @param {string} phone - Telefone a ser formatado
   * @returns {string} Telefone formatado
   */
  static formatPhone(phone) {
    const digits = PhoneValidator.onlyDigits(phone);
    
    if (digits.length === 10) {
      // Telefone fixo: (00) 0000-0000
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 11) {
      // Celular: (00) 00000-0000
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  /**
   * Formata CEP (00000-000)
   * @param {string} cep - CEP a ser formatado
   * @returns {string} CEP formatado
   */
  static formatCEP(cep) {
    const digits = DocumentValidator.onlyDigits(cep);
    if (digits.length !== 8) return cep;
    
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  /**
   * Formata moeda brasileira (R$ 0.000,00)
   * @param {number} value - Valor a ser formatado
   * @returns {string} Valor formatado
   */
  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata data para padrão brasileiro (DD/MM/YYYY)
   * @param {Date|string} date - Data a ser formatada
   * @returns {string} Data formatada
   */
  static formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  /**
   * Formata data e hora para padrão brasileiro (DD/MM/YYYY HH:mm:ss)
   * @param {Date|string} date - Data a ser formatada
   * @returns {string} Data e hora formatadas
   */
  static formatDateTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('pt-BR');
  }

  /**
   * Capitaliza primeira letra de cada palavra
   * @param {string} text - Texto a ser capitalizado
   * @returns {string} Texto capitalizado
   */
  static capitalize(text) {
    return String(text)
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Trunca texto com ellipsis
   * @param {string} text - Texto a ser truncado
   * @param {number} maxLength - Tamanho máximo
   * @returns {string} Texto truncado
   */
  static truncate(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }
}

// Exports nomeados para compatibilidade
export const formatCPF = FormatUtils.formatCPF.bind(FormatUtils);
export const formatCNPJ = FormatUtils.formatCNPJ.bind(FormatUtils);
export const formatPhone = FormatUtils.formatPhone.bind(FormatUtils);
export const formatCEP = FormatUtils.formatCEP.bind(FormatUtils);
export const formatCurrency = FormatUtils.formatCurrency.bind(FormatUtils);
export const formatDate = FormatUtils.formatDate.bind(FormatUtils);
export const formatDateTime = FormatUtils.formatDateTime.bind(FormatUtils);

export default FormatUtils;
