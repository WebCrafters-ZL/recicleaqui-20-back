/**
 * AuthRepository - Encapsula acesso ao banco para autenticação
 */
export default class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Busca usuário por email
   */
  async findUserByEmail(email) {
    return this.prisma.user.findUnique({ 
      where: { email } 
    });
  }

  /**
   * Busca informações do cliente associado ao usuário
   */
  async findClientByUserId(userId) {
    return this.prisma.client.findUnique({
      where: { userId },
      select: { id: true, type: true }
    });
  }
}
