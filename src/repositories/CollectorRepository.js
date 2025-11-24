/**
 * CollectorRepository - Encapsula acesso ao banco para operações com coletores
 */
export default class CollectorRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Cria coletor com transação
   */
  async create({ 
    email, 
    password, 
    phone, 
    companyName, 
    tradeName, 
    cnpj, 
    description, 
    operatingHours,
    collectionType,
    acceptedMaterials, 
    headquarters,
    collectionPoints
  }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ 
        data: { 
          email, 
          password,
          role: 'COLLECTOR'
        } 
      });

      const collector = await tx.collector.create({
        data: {
          companyName,
          tradeName,
          cnpj,
          phone,
          description,
          operatingHours,
          collectionType: collectionType || 'BOTH',
          acceptedMaterials: acceptedMaterials || [],
          userId: user.id
        }
      });

      await tx.collectorHeadquarters.create({ 
        data: { 
          ...headquarters, 
          collectorId: collector.id 
        } 
      });

      if (collectionPoints && collectionPoints.length > 0) {
        await tx.collectionPoint.createMany({
          data: collectionPoints.map(point => ({
            ...point,
            collectorId: collector.id
          }))
        });
      }

      return { 
        id: collector.id, 
        userId: user.id, 
        email: user.email,
        role: user.role,
        collectionType: collector.collectionType
      };
    });
  }

  /**
   * Busca coletor por ID
   */
  async findById(id) {
    return this.prisma.collector.findUnique({ 
      where: { id }, 
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            role: true, 
            createdAt: true 
          } 
        }, 
        headquarters: true,
        collectionPoints: {
          where: { isActive: true }
        }
      } 
    });
  }

  /**
   * Lista todos os coletores
   */
  async findAll() {
    return this.prisma.collector.findMany({ 
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            role: true, 
            createdAt: true 
          } 
        }, 
        headquarters: true,
        collectionPoints: {
          where: { isActive: true }
        }
      } 
    });
  }

  /**
   * Busca coletores com filtros
   */
  async search(where) {
    return this.prisma.collector.findMany({
      where,
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            createdAt: true 
          } 
        }, 
        headquarters: true,
        collectionPoints: {
          where: { isActive: true }
        }
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
   * Busca CNPJ existente (normalizado)
   */
  async findExistingCnpj(cnpj) {
    const [result] = await this.prisma.$queryRaw`
      SELECT id FROM "Collector" 
      WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${cnpj} 
      LIMIT 1
    `;
    return result;
  }

  /**
   * Verifica CNPJ já cadastrado (com exceção de um collectorId específico)
   */
  async checkCnpjConflict(cnpj, excludeCollectorId) {
    const [result] = await this.prisma.$queryRaw`
      SELECT id FROM "Collector" 
      WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${cnpj} 
      AND id != ${excludeCollectorId}
      LIMIT 1
    `;
    return result;
  }

  /**
   * Atualiza coletor com transação
   */
  async update(id, { phone, companyName, tradeName, cnpj, description, operatingHours, collectionType, acceptedMaterials, headquarters }) {
    return this.prisma.$transaction(async (tx) => {
      const updateData = {};
      if (phone) updateData.phone = phone;
      if (companyName) updateData.companyName = companyName;
      if (tradeName) updateData.tradeName = tradeName;
      if (cnpj) updateData.cnpj = cnpj;
      if (description !== undefined) updateData.description = description;
      if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
      if (collectionType) updateData.collectionType = collectionType;
      if (acceptedMaterials) updateData.acceptedMaterials = acceptedMaterials;

      if (Object.keys(updateData).length > 0) {
        updateData.editedAt = new Date();
        await tx.collector.update({ where: { id }, data: updateData });
      }

      if (headquarters) {
        const existing = await tx.collectorHeadquarters.findUnique({ 
          where: { collectorId: id } 
        }).catch(() => null);
        
        if (existing) {
          await tx.collectorHeadquarters.update({ 
            where: { collectorId: id }, 
            data: { ...headquarters, editedAt: new Date() } 
          });
        } else {
          await tx.collectorHeadquarters.create({ 
            data: { ...headquarters, collectorId: id } 
          });
        }
      }

      return tx.collector.findUnique({ 
        where: { id }, 
        include: { 
          user: { 
            select: { 
              id: true, 
              email: true, 
              role: true 
            } 
          }, 
          headquarters: true,
          collectionPoints: {
            where: { isActive: true }
          }
        } 
      });
    });
  }

  /**
   * Deleta coletor
   */
  async delete(id) {
    return this.prisma.collector.delete({ where: { id } });
  }

  /**
   * Cria ponto de coleta
   */
  async createCollectionPoint(data) {
    return this.prisma.collectionPoint.create({ data });
  }

  /**
   * Atualiza ponto de coleta
   */
  async updateCollectionPoint(id, data) {
    return this.prisma.collectionPoint.update({
      where: { id },
      data: {
        ...data,
        editedAt: new Date()
      }
    });
  }

  /**
   * Soft delete de ponto de coleta
   */
  async deleteCollectionPoint(id) {
    return this.prisma.collectionPoint.update({
      where: { id },
      data: { isActive: false, editedAt: new Date() }
    });
  }

  /**
   * Busca ponto de coleta por ID
   */
  async findCollectionPointById(id) {
    return this.prisma.collectionPoint.findUnique({ where: { id } });
  }

  /**
   * Lista pontos de coleta de um coletor
   */
  async findCollectionPointsByCollectorId(collectorId) {
    return this.prisma.collectionPoint.findMany({
      where: { 
        collectorId,
        isActive: true
      }
    });
  }
}
