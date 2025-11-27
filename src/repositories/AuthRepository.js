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

  /**
   * Atualiza o token de reset de senha do usuário
   */
  async updateResetToken(userId, resetToken, generatedAt) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { resetToken, resetTokenGeneratedAt: generatedAt }
    });
  }

  /**
   * Busca usuário pelo resetToken
   */
  async findUserByResetToken(resetToken) {
    return this.prisma.user.findFirst({
      where: { resetToken }
    });
  }

  /**
   * Busca usuário pelo email e resetToken
   */
  async findUserByEmailAndResetToken(email, resetToken) {
    return this.prisma.user.findFirst({
      where: { 
        email,
        resetToken 
      }
    });
  }

  /**
   * Atualiza senha e limpa informações de reset
   */
  async updatePasswordAndClearReset(userId, newHashedPassword) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashedPassword,
        resetToken: null,
        resetTokenGeneratedAt: null,
        editedAt: new Date()
      }
    });
  }
}
