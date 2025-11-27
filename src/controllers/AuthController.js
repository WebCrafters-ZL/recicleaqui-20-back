import BaseController from '../core/BaseController.js';
import logger from '../utils/Logger.js';

/**
 * AuthController - Gerencia requisições de autenticação
 */
export default class AuthController extends BaseController {
  constructor(authService) {
    super();
    this.authService = authService;
    
    // Bind methods
    this.login = this.login.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async login(req, res) {
    const { email, password } = req.body;

    this.validateRequiredFields(req.body, ['email', 'password']);

    logger.info(`Tentativa de login para o email: ${email}`);
    const result = await this.authService.authenticate(email, password);

    logger.info(`Login bem-sucedido para o usuário: ${email}`);
    return res.status(200).json(result);
  }

  async forgotPassword(req, res) {
    const { email } = req.body;
    this.validateRequiredFields(req.body, ['email']);
    const result = await this.authService.requestPasswordReset(email);
    return res.status(200).json(result);
  }

  async resetPassword(req, res) {
    const { email, code, password } = req.body;
    this.validateRequiredFields(req.body, ['email', 'code', 'password']);
    const result = await this.authService.resetPassword(email, code, password);
    return res.status(200).json(result);
  }
}
