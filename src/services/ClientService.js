import BaseService from '../core/BaseService.js';
import { hashPassword } from '../utils/HashUtils.js';
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
    const { email, password, phone, firstName, lastName, cpf, address } = data;

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
      address
    });
  }

  /**
   * Cria cliente Company
   */
  async createCompanyClient(data) {
    const { email, password, phone, companyName, tradeName, cnpj, address } = data;

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
      address
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
    const { phone, firstName, lastName, cpf, address } = data;

    // Verifica se cliente existe
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw this.createError('Cliente não encontrado', 404);
    }

    // Valida CPF se fornecido
    let normalizedCpf = null;
    if (cpf) {
      normalizedCpf = onlyDigits(cpf);
      if (!isValidCPF(normalizedCpf)) {
        throw this.createError('CPF inválido');
      }
      const conflict = await this.clientRepo.checkCpfConflict(normalizedCpf, id);
      if (conflict) {
        throw this.createError('CPF já cadastrado', 409);
      }
    }

    return this.clientRepo.updateIndividual(id, {
      phone,
      firstName,
      lastName,
      cpf: normalizedCpf,
      address
    });
  }

  /**
   * Atualiza cliente Company
   */
  async updateCompanyClient(id, data) {
    const { phone, companyName, tradeName, cnpj, address } = data;

    // Verifica se cliente existe
    const client = await this.clientRepo.findById(id);
    if (!client) {
      throw this.createError('Cliente não encontrado', 404);
    }

    // Valida CNPJ se fornecido
    let normalizedCnpj = null;
    if (cnpj) {
      normalizedCnpj = onlyDigits(cnpj);
      if (!isValidCNPJ(normalizedCnpj)) {
        throw this.createError('CNPJ inválido');
      }
      const conflict = await this.clientRepo.checkCnpjConflict(normalizedCnpj, id);
      if (conflict) {
        throw this.createError('CNPJ já cadastrado', 409);
      }
    }

    return this.clientRepo.updateCompany(id, {
      phone,
      companyName,
      tradeName,
      cnpj: normalizedCnpj,
      address
    });
  }

  /**
   * Deleta cliente
   */
  async deleteClient(id) {
    return this.clientRepo.delete(id);
  }
}
