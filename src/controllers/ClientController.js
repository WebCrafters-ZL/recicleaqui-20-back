import BaseController from '../core/BaseController.js';

/**
 * ClientController - Gerencia requisições relacionadas a clientes
 */
export default class ClientController extends BaseController {
  constructor(clientService) {
    super();
    this.clientService = clientService;
    
    // Bind methods para uso como route handlers
    this.createIndividualClient = this.createIndividualClient.bind(this);
    this.createCompanyClient = this.createCompanyClient.bind(this);
    this.getClientById = this.getClientById.bind(this);
    this.updateIndividualClient = this.updateIndividualClient.bind(this);
    this.updateCompanyClient = this.updateCompanyClient.bind(this);
    this.deleteClient = this.deleteClient.bind(this);
    this.listAllClients = this.listAllClients.bind(this);
    this.getMe = this.getMe.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
  }

  async createIndividualClient(req, res) {
    const result = await this.clientService.createIndividualClient(req.body);
    return res.status(201).json(result);
  }

  async createCompanyClient(req, res) {
    const result = await this.clientService.createCompanyClient(req.body);
    return res.status(201).json(result);
  }

  async getClientById(req, res) {
    const id = this.validateId(req.params.id || req.query.id);
    const client = await this.clientService.getClientById(id);
    return res.json(client);
  }

  async updateIndividualClient(req, res) {
    const id = this.validateId(req.params.id);
    const result = await this.clientService.updateIndividualClient(id, req.body);
    return res.json(result);
  }

  async updateCompanyClient(req, res) {
    const id = this.validateId(req.params.id);
    const result = await this.clientService.updateCompanyClient(id, req.body);
    return res.json(result);
  }

  async deleteClient(req, res) {
    const id = this.validateId(req.params.id);
    await this.clientService.deleteClient(id);
    return res.status(204).send();
  }

  async listAllClients(req, res) {
    const clients = await this.clientService.listAllClients();
    return res.json(clients);
  }

  async getMe(req, res) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    // Garante que o userId seja inteiro
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }
    const client = await this.clientService.getClientByUserId(userIdInt);
    return res.json(client);
  }

  async changePassword(req, res) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const { currentPassword, newPassword } = req.body || {};
    const result = await this.clientService.changePassword(userIdInt, currentPassword, newPassword);
    return res.status(200).json({ message: 'Senha alterada com sucesso', ...result });
  }

  /**
   * Solicita o envio de um código de redefinição de senha.
   */
  async requestPasswordReset(req, res) {
    const { email } = req.body;
    try {
      const response = await this.clientService.sendPasswordResetCode(email);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}
