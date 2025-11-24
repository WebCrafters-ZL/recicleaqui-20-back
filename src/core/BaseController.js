/**
 * Base Controller - Fornece estrutura comum para controllers
 */
export default class BaseController {
  /**
   * Wrapper para handlers assíncronos que captura erros e os encaminha para o error handler
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn.call(this, req, res, next)).catch(next);
    };
  }

  /**
   * Helper para validar IDs numéricos
   */
  validateId(id, fieldName = 'ID') {
    const numId = Number(id);
    if (!numId || Number.isNaN(numId)) {
      throw Object.assign(new Error(`${fieldName} inválido`), { status: 400 });
    }
    return numId;
  }

  /**
   * Helper para validar campos obrigatórios
   */
  validateRequiredFields(data, requiredFields) {
    // eslint-disable-next-line security/detect-object-injection -- requiredFields é controlado e vem de array de strings definido pelo desenvolvedor
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw Object.assign(
        new Error(`Campos obrigatórios ausentes: ${missing.join(', ')}`),
        { status: 400 }
      );
    }
  }
}
