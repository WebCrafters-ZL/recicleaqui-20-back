import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * DatabaseManager - Gerencia conexão com o banco de dados via Prisma
 */
class DatabaseManager {
  constructor(options = {}) {
    this.client = null;
    this.pool = null;
    this.options = options;
  }

  /**
   * Obtém ou cria cliente Prisma (singleton)
   */
  getClient() {
    if (!this.client) {
      // Recria o adapter-pg corretamente (obrigatório no Prisma 7)
      this.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(this.pool);

      this.client = new PrismaClient({
        adapter,
        log: this.options.log || (process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn']),
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
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Verifica se a conexão está ativa
   */
  async healthCheck() {
    try {
      await this.getClient().$queryRaw(Prisma.sql`SELECT 1`);
      return { healthy: true };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Instância singleton global (definida após a classe para compatibilidade do parser)
   */

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

// Define a propriedade estática fora da classe para compatibilidade de parser
DatabaseManager.instance = null;

// Instância singleton para compatibilidade
const databaseManager = DatabaseManager.getInstance();
const prisma = databaseManager.getClient();

// Export do cliente para compatibilidade
export default prisma;

// Export da classe e Prisma
export { DatabaseManager, Prisma };