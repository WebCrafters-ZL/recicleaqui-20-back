import { MATERIAL_LINES } from '../Constants.js';

/**
 * MaterialValidator - Valida linhas de material para coleta
 */
class MaterialValidator {
  /**
   * Valida se string é uma linha de material válida
   * @param {string} line - Linha de material
   * @returns {boolean} true se válida
   */
  static isValidLine(line) {
    return MATERIAL_LINES.includes(String(line).toUpperCase());
  }

  /**
   * Valida array de linhas (todas devem ser válidas)
   * @param {Array<string>} lines - Array de linhas
   * @returns {boolean} true se todas forem válidas
   */
  static areValidLines(lines) {
    if (!Array.isArray(lines) || lines.length === 0) return false;
    return lines.every(l => this.isValidLine(l));
  }

  /**
   * Normaliza linha de material (uppercase)
   * @param {string} line - Linha de material
   * @returns {string} Linha normalizada
   */
  static normalize(line) {
    return String(line).toUpperCase();
  }

  /**
   * Normaliza array de linhas
   * @param {Array<string>} lines - Array de linhas
   * @returns {Array<string>} Linhas normalizadas
   */
  static normalizeArray(lines) {
    if (!Array.isArray(lines)) return [];
    return lines.map(l => this.normalize(l));
  }
}

export default MaterialValidator;
