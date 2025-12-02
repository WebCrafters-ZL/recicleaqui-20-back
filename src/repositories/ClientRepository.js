import { Prisma } from '@prisma/client';
import { enrichAddressWithCoordinates } from '../utils/GeocodingUtils.js';

/**
 * ClientRepository - Encapsula acesso ao banco para operações com clientes
 */
export default class ClientRepository {
  constructor(prisma) {
    this.prisma = prisma;
    this.uniqueMode = (process.env.PRISMA_UNIQUE_MODE || 'findFirst').toLowerCase();
    if (!['findunique', 'findfirst'].includes(this.uniqueMode)) {
      this.uniqueMode = 'findfirst';
    }
  }

  /**
   * Cria cliente tipo Individual com transação
   */
  async createIndividual({ email, password, phone, firstName, lastName, cpf, address, avatarUrl }) {
    // Geocodifica o endereço antes da transação
    let enrichedAddress = null;
    if (address) {
      enrichedAddress = await enrichAddressWithCoordinates(address);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ 
        data: { email, password } 
      });

      const client = await tx.client.create({
        data: {
          type: 'individual',
          phone,
          avatarUrl,
          userId: user.id
        }
      });

      await tx.individual.create({
        data: {
          firstName,
          lastName,
          cpf,
          clientId: client.id
        }
      });

      if (enrichedAddress) {
        await tx.address.create({ 
          data: { ...enrichedAddress, clientId: client.id } 
        });
      }

      return { id: client.id, userId: user.id, type: client.type };
    });
  }

  /**
   * Cria cliente tipo Company com transação
   */
  async createCompany({ email, password, phone, companyName, tradeName, cnpj, address, avatarUrl }) {
    // Geocodifica o endereço antes da transação
    let enrichedAddress = null;
    if (address) {
      enrichedAddress = await enrichAddressWithCoordinates(address);
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ 
        data: { email, password } 
      });

      const client = await tx.client.create({
        data: {
          type: 'company',
          phone,
          avatarUrl,
          userId: user.id
        }
      });

      await tx.company.create({ 
        data: { 
          companyName, 
          tradeName, 
          cnpj, 
          clientId: client.id 
        } 
      });

      if (enrichedAddress) {
        await tx.address.create({ 
          data: { ...enrichedAddress, clientId: client.id } 
        });
      }

      return { id: client.id, userId: user.id, type: client.type };
    });
  }

  /**
   * Busca cliente por ID com includes
   */
  async findById(id) {
    const method = this.uniqueMode === 'findunique' ? 'findUnique' : 'findFirst';
    return this.prisma.client[method]({ 
      where: { id }, 
      include: { 
        user: true, 
        individual: true, 
        company: true, 
        address: true 
      } 
    });
  }

  /**
   * Busca cliente por userId
   */
  async findByUserId(userId) {
    const method = this.uniqueMode === 'findunique' ? 'findUnique' : 'findFirst';
    return this.prisma.client[method]({
      where: { userId },
      include: { 
        user: true, 
        individual: true, 
        company: true, 
        address: true 
      }
    });
  }

  /**
   * Lista todos os clientes
   */
  async findAll() {
    return this.prisma.client.findMany({ 
      include: { 
        user: true, 
        individual: true, 
        company: true, 
        address: true 
      } 
    });
  }

  /**
   * Busca usuário por email
   */
  async findUserByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Busca usuário por ID
   */
  async findUserById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Busca CPF existente (normalizado)
   */
  async findExistingCpf(cpf) {
    const result = await this.prisma.$queryRaw(
      Prisma.sql`SELECT id FROM "Individual" 
      WHERE regexp_replace(cpf, '\\D', '', 'g') = ${cpf} 
      LIMIT 1`
    );
    return result[0];
  }

  /**
   * Busca CNPJ existente (normalizado)
   */
  async findExistingCnpj(cnpj) {
    const result = await this.prisma.$queryRaw(
      Prisma.sql`SELECT id FROM "Company" 
      WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${cnpj} 
      LIMIT 1`
    );
    return result[0];
  }

  /**
   * Atualiza cliente Individual com transação
   */
  async updateIndividual(id, { phone, firstName, lastName, cpf, address, avatarUrl }) {
    // Geocodifica o endereço antes da transação
    let enrichedAddress = null;
    if (address) {
      enrichedAddress = await enrichAddressWithCoordinates(address);
    }

    return this.prisma.$transaction(async (tx) => {
      if (phone || avatarUrl !== undefined) {
        const updateData = { editedAt: new Date() };
        if (phone) updateData.phone = phone;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        await tx.client.update({ 
          where: { id }, 
          data: updateData
        });
      }

      if (firstName || lastName || cpf) {
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (cpf) updateData.cpf = cpf;
        updateData.editedAt = new Date();

        await tx.individual.update({
          where: { clientId: id },
          data: updateData
        });
      }

      if (enrichedAddress) {
        const existing = await tx.address.findUnique({ 
          where: { clientId: id } 
        }).catch(() => null);
        
        if (existing) {
          await tx.address.update({ 
            where: { clientId: id }, 
            data: { ...enrichedAddress, editedAt: new Date() } 
          });
        } else {
          await tx.address.create({ 
            data: { ...enrichedAddress, clientId: id } 
          });
        }
      }

      const method = this.uniqueMode === 'findunique' ? 'findUnique' : 'findFirst';
      return tx.client[method]({ 
        where: { id }, 
        include: { 
          user: true, 
          individual: true, 
          address: true 
        } 
      });
    });
  }

  /**
   * Atualiza cliente Company com transação
   */
  async updateCompany(id, { phone, companyName, tradeName, cnpj, address, avatarUrl }) {
    // Geocodifica o endereço antes da transação
    let enrichedAddress = null;
    if (address) {
      enrichedAddress = await enrichAddressWithCoordinates(address);
    }

    return this.prisma.$transaction(async (tx) => {
      if (phone || avatarUrl !== undefined) {
        const updateData = { editedAt: new Date() };
        if (phone) updateData.phone = phone;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        await tx.client.update({ 
          where: { id }, 
          data: updateData
        });
      }

      if (companyName || tradeName || cnpj) {
        const updateData = {};
        if (companyName) updateData.companyName = companyName;
        if (tradeName) updateData.tradeName = tradeName;
        if (cnpj) updateData.cnpj = cnpj;
        updateData.editedAt = new Date();

        await tx.company.update({
          where: { clientId: id },
          data: updateData
        });
      }

      if (enrichedAddress) {
        const existing = await tx.address.findUnique({ 
          where: { clientId: id } 
        }).catch(() => null);
        
        if (existing) {
          await tx.address.update({ 
            where: { clientId: id }, 
            data: { ...enrichedAddress, editedAt: new Date() } 
          });
        } else {
          await tx.address.create({ 
            data: { ...enrichedAddress, clientId: id } 
          });
        }
      }

      const method = this.uniqueMode === 'findunique' ? 'findUnique' : 'findFirst';
      return tx.client[method]({ 
        where: { id }, 
        include: { 
          user: true, 
          company: true, 
          address: true 
        } 
      });
    });
  }

  /**
   * Verifica CPF já cadastrado (com exceção de um clientId específico)
   */
  async checkCpfConflict(cpf, excludeClientId) {
    const result = await this.prisma.$queryRaw(
      Prisma.sql`SELECT id, "clientId" FROM "Individual" 
      WHERE regexp_replace(cpf, '\\D', '', 'g') = ${cpf} 
      LIMIT 1`
    );
    const row = result[0];
    return row && row.clientId !== excludeClientId ? row : null;
  }

  /**
   * Verifica CNPJ já cadastrado (com exceção de um clientId específico)
   */
  async checkCnpjConflict(cnpj, excludeClientId) {
    const result = await this.prisma.$queryRaw(
      Prisma.sql`SELECT id, "clientId" FROM "Company" 
      WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${cnpj} 
      LIMIT 1`
    );
    const row = result[0];
    return row && row.clientId !== excludeClientId ? row : null;
  }

  /**
   * Deleta cliente
   */
  async delete(id) {
    return this.prisma.client.delete({ where: { id } });
  }

  /**
   * Atualiza a senha do usuário
   */
  async updateUserPassword(userId, hashedPassword) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, editedAt: new Date() }
    });
  }
}
