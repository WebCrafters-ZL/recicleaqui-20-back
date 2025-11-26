/**
 * HttpErrorUtils - Utilitários para criação de erros HTTP
 * Facilita criação de erros com status code apropriado
 */
class HttpErrorUtils {
  /**
   * Cria um erro com status HTTP
   * @param {string} message - Mensagem do erro
   * @param {number} status - Status HTTP (padrão: 400)
   * @returns {Error} Erro com propriedade status
   */
  static createError(message, status = 400) {
    return Object.assign(new Error(message), { status });
  }

  /**
   * Cria erro 400 - Bad Request
   */
  static badRequest(message = 'Requisição inválida') {
    return this.createError(message, 400);
  }

  /**
   * Cria erro 401 - Unauthorized
   */
  static unauthorized(message = 'Não autorizado') {
    return this.createError(message, 401);
  }

  /**
   * Cria erro 403 - Forbidden
   */
  static forbidden(message = 'Acesso negado') {
    return this.createError(message, 403);
  }

  /**
   * Cria erro 404 - Not Found
   */
  static notFound(message = 'Recurso não encontrado') {
    return this.createError(message, 404);
  }

  /**
   * Cria erro 409 - Conflict
   */
  static conflict(message = 'Conflito de dados') {
    return this.createError(message, 409);
  }

  /**
   * Cria erro 422 - Unprocessable Entity
   */
  static unprocessableEntity(message = 'Entidade não processável') {
    return this.createError(message, 422);
  }

  /**
   * Cria erro 500 - Internal Server Error
   */
  static internalServerError(message = 'Erro interno do servidor') {
    return this.createError(message, 500);
  }

  /**
   * Verifica se um erro tem status HTTP
   */
  static hasStatus(error) {
    return error && typeof error.status === 'number';
  }

  /**
   * Extrai status de um erro (padrão: 500)
   */
  static getStatus(error) {
    return this.hasStatus(error) ? error.status : 500;
  }
}

// Exports nomeados para compatibilidade
export const createError = HttpErrorUtils.createError.bind(HttpErrorUtils);
export const badRequest = HttpErrorUtils.badRequest.bind(HttpErrorUtils);
export const unauthorized = HttpErrorUtils.unauthorized.bind(HttpErrorUtils);
export const forbidden = HttpErrorUtils.forbidden.bind(HttpErrorUtils);
export const notFound = HttpErrorUtils.notFound.bind(HttpErrorUtils);
export const conflict = HttpErrorUtils.conflict.bind(HttpErrorUtils);
export const unprocessableEntity = HttpErrorUtils.unprocessableEntity.bind(HttpErrorUtils);
export const internalServerError = HttpErrorUtils.internalServerError.bind(HttpErrorUtils);

export default HttpErrorUtils;
