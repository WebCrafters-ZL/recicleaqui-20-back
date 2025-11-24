import { PrismaClient } from '@prisma/client';

/**
 * DatabaseManager - Gerencia conexão com o banco de dados via Prisma
 */
class DatabaseManager {
  constructor(options = {}) {
    this.client = null;
    this.options = options;
  }

  /**
   * Obtém ou cria cliente Prisma (singleton)
   */
  getClient() {
    if (!this.client) {
      this.client = new PrismaClient({
        log: this.options.log || ['error', 'warn'],
        ...this.options
      });
    }
    return this.client;
  }

  /**
   * Conecta ao banco de dados
   */
  async connect() {
    const client = this.getClient();
    await client.$connect();
    return client;
  }

  /**
   * Desconecta do banco de dados
   */
  async disconnect() {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
    }
  }

  /**
   * Verifica se a conexão está ativa
   */
  async healthCheck() {
    try {
      await this.getClient().$queryRaw`SELECT 1`;
      return { healthy: true };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Instância singleton global
   */
  static instance = null;

  /**
   * Obtém instância singleton
   */
  static getInstance(options) {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(options);
    }
    return DatabaseManager.instance;
  }
}

// Instância singleton para compatibilidade
const databaseManager = DatabaseManager.getInstance();
const prisma = databaseManager.getClient();

// Export do cliente para compatibilidade
export default prisma;

// Export da classe
export { DatabaseManager };