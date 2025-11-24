/**
 * Base Service - Fornece estrutura comum para services
 */
export default class BaseService {
  /**
   * Helper para criar erro com status HTTP
   */
  createError(message, status = 400) {
    return Object.assign(new Error(message), { status });
  }

  /**
   * Helper para validar campos obrigatórios
   */
  validateRequiredFields(data, requiredFields) {
    // eslint-disable-next-line security/detect-object-injection -- requiredFields é controlado e vem de array de strings definido pelo desenvolvedor
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw this.createError(`Campos obrigatórios ausentes: ${missing.join(', ')}`);
    }
  }
}
