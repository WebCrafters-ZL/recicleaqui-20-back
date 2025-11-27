import BaseService from '../core/BaseService.js';
import { hashPassword, comparePassword } from '../utils/HashUtils.js';
import { isValidCNPJ, isValidCPF, isValidEmail, onlyDigits } from '../utils/Validators.js';

/**
 * ClientService - Gerencia lógica de negócio para clientes
 */
export default class ClientService extends BaseService {
  constructor(clientRepository) {
    super();
    this.clientRepo = clientRepository;
  }

  /**
   * Cria cliente Individual
   */
  async createIndividualClient(data) {
    const { email, password, phone, firstName, lastName, cpf, address, avatarUrl } = data;

    // Validação de campos obrigatórios
    this.validateRequiredFields(data, ['email', 'password', 'phone', 'firstName', 'lastName', 'cpf']);

    // Normaliza e valida
    const normalizedCpf = onlyDigits(cpf);
    if (!isValidEmail(email)) {
      throw this.createError('Email inválido');
    }
    if (!isValidCPF(normalizedCpf)) {
      throw this.createError('CPF inválido');
    }

    // Verificações de unicidade
    const existingUser = await this.clientRepo.findUserByEmail(email);
    if (existingUser) {
      throw this.createError('Email já cadastrado', 409);
    }

    const existingCpf = await this.clientRepo.findExistingCpf(normalizedCpf);
    if (existingCpf) {
      throw this.createError('CPF já cadastrado', 409);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar cliente
    return this.clientRepo.createIndividual({
      email,
      password: hashedPassword,
      phone,
      firstName,
      lastName,
      cpf: normalizedCpf,
      address,
      avatarUrl
    });
  }

  /**
   * Cria cliente Company
   */
  async createCompanyClient(data) {
    const { email, password, phone, companyName, tradeName, cnpj, address, avatarUrl } = data;

    // Validação de campos obrigatórios
    this.validateRequiredFields(data, ['email', 'password', 'phone', 'companyName', 'tradeName', 'cnpj']);

    // Normaliza e valida
    const normalizedCnpj = onlyDigits(cnpj);
    if (!isValidEmail(email)) {
      throw this.createError('Email inválido');
    }
    if (!isValidCNPJ(normalizedCnpj)) {
      throw this.createError('CNPJ inválido');
    }

    // Verificações de unicidade
    const existingUser = await this.clientRepo.findUserByEmail(email);
    if (existingUser) {
      throw this.createError('Email já cadastrado', 409);
    }

    const existingCnpj = await this.clientRepo.findExistingCnpj(normalizedCnpj);
    if (existingCnpj) {
      throw this.createError('CNPJ já cadastrado', 409);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar cliente
    return this.clientRepo.createCompany({
      email,
      password: hashedPassword,
      phone,
      companyName,
      tradeName,
      cnpj: normalizedCnpj,
      address,
      avatarUrl
    });
  }

  /**
   * Busca cliente por ID
   */
  async getClientById(id) {
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw this.createError('Cliente não encontrado', 404);
    }
    return client;
  }

  /**
   * Busca cliente por userId (para /me)
   */
  async getClientByUserId(userId) {
    const client = await this.clientRepo.findByUserId(userId);
    if (!client) {
      throw this.createError('Cliente não encontrado', 404);
    }
    return client;
  }

  /**
   * Lista todos os clientes
   */
  async listAllClients() {
    return this.clientRepo.findAll();
  }

  /**
   * Atualiza cliente Individual
   */
  async updateIndividualClient(id, data) {
    const { phone, firstName, lastName, cpf, address, avatarUrl, email, password } = data;

    // Verifica se cliente existe
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw this.createError('Cliente não encontrado', 404);
    }

    // Bloqueia alterações de campos imutáveis
    if (email !== undefined) {
      throw this.createError('Email não pode ser alterado', 400);
    }
    if (password !== undefined) {
      throw this.createError('Senha deve ser alterada em fluxo próprio', 400);
    }
    if (cpf !== undefined) {
      throw this.createError('CPF não pode ser alterado', 400);
    }

    return this.clientRepo.updateIndividual(id, {
      phone,
      firstName,
      lastName,
      // Não permitir alteração de CPF
      cpf: null,
      address,
      avatarUrl
    });
  }

  /**
   * Atualiza cliente Company
   */
  async updateCompanyClient(id, data) {
    const { phone, companyName, tradeName, cnpj, address, avatarUrl, email, password } = data;

    // Verifica se cliente existe
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw this.createError('Cliente não encontrado', 404);
    }

    // Bloqueia alterações de campos imutáveis
    if (email !== undefined) {
      throw this.createError('Email não pode ser alterado', 400);
    }
    if (password !== undefined) {
      throw this.createError('Senha deve ser alterada em fluxo próprio', 400);
    }
    if (cnpj !== undefined) {
      throw this.createError('CNPJ não pode ser alterado', 400);
    }

    return this.clientRepo.updateCompany(id, {
      phone,
      companyName,
      tradeName,
      // Não permitir alteração de CNPJ
      cnpj: null,
      address,
      avatarUrl
    });
  }

  /**
   * Deleta cliente
   */
  async deleteClient(id) {
    return this.clientRepo.delete(id);
  }

  /**
   * Altera senha do usuário dono do cliente
   */
  async changePassword(userId, currentPassword, newPassword) {
    this.validateRequiredFields({ currentPassword, newPassword }, ['currentPassword', 'newPassword']);

    const user = await this.clientRepo.findUserById(userId);
    if (!user) {
      throw this.createError('Usuário não encontrado', 404);
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw this.createError('Senha atual inválida', 400);
    }

    const hashed = await hashPassword(newPassword);
    await this.clientRepo.updateUserPassword(userId, hashed);
    return { userId };
  }
}
