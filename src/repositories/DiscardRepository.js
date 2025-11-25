/**
 * DiscardRepository - Operações de banco para descartes e ofertas
 */
export default class DiscardRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Cria descarte
  async createDiscard(data) {
    return this.prisma.discard.create({ data });
  }

  // Busca descarte por ID
  async findById(id) {
    return this.prisma.discard.findUnique({
      where: { id },
      include: { collectionPoint: true, offers: true }
    });
  }

  // Atualiza descarte
  async updateDiscard(id, data) {
    return this.prisma.discard.update({ where: { id }, data: { ...data, editedAt: new Date() } });
  }

  // Lista descartes filtrados
  async listDiscards(where, include = {}) {
    return this.prisma.discard.findMany({ where, include });
  }

  // Criar oferta
  async createOffer(data) {
    return this.prisma.offer.create({ data });
  }

  async findOfferById(id) {
    return this.prisma.offer.findUnique({ where: { id }, include: { discard: true, collector: true } });
  }

  async updateOffer(id, data) {
    return this.prisma.offer.update({ where: { id }, data: { ...data, editedAt: new Date() } });
  }

  // Pontos de coleta que aceitam todas as linhas informadas
  async findCollectionPointsAcceptingLines(lines) {
    return this.prisma.collectionPoint.findMany({
      where: {
        isActive: true,
        AND: lines.map(l => ({ acceptedLines: { has: l } }))
      },
      include: { collector: true }
    });
  }
}
