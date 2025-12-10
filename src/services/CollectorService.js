import BaseService from '../core/BaseService.js';
import { hashPassword } from '../utils/HashUtils.js';
import { isValidEmail, isValidCNPJ, onlyDigits } from '../utils/Validators.js';

/**
 * CollectorService - Gerencia lógica de negócio para coletores
 */
export default class CollectorService extends BaseService {
  constructor(collectorRepository) {
    super();
    this.collectorRepo = collectorRepository;
  }

  /**
   * Cria coletor
   */
  async createCollector(data) {
    const { 
      email, 
      password, 
      phone, 
      companyName, 
      tradeName, 
      cnpj, 
      description, 
      operatingHours,
      collectionType,
      acceptedLines,
      // suporte legado
      acceptedMaterials, 
      headquarters,
      collectionPoints
    } = data;

    // Validação de campos obrigatórios
    this.validateRequiredFields(data, ['email', 'password', 'phone', 'companyName', 'tradeName', 'cnpj', 'headquarters']);

    // Validar collectionType
    if (collectionType && !['HOME_PICKUP', 'DROP_OFF_POINT', 'BOTH'].includes(collectionType)) {
      throw this.createError('Tipo de coleta inválido');
    }

    // Se for DROP_OFF_POINT ou BOTH, deve ter pontos de coleta
    if ((collectionType === 'DROP_OFF_POINT' || collectionType === 'BOTH') && 
        (!collectionPoints || collectionPoints.length === 0)) {
      throw this.createError('Pontos de coleta são obrigatórios para este tipo de operação');
    }

    // Normaliza e valida
    const normalizedCnpj = onlyDigits(cnpj);
    if (!isValidEmail(email)) {
      throw this.createError('Email inválido');
    }
    if (!isValidCNPJ(normalizedCnpj)) {
      throw this.createError('CNPJ inválido');
    }

    // Verificações de unicidade
    const existingUser = await this.collectorRepo.findUserByEmail(email);
    if (existingUser) {
      throw this.createError('Email já cadastrado', 409);
    }

    const existingCnpj = await this.collectorRepo.findExistingCnpj(normalizedCnpj);
    if (existingCnpj) {
      throw this.createError('CNPJ já cadastrado', 409);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar coletor
    return this.collectorRepo.create({
      email,
      password: hashedPassword,
      phone,
      companyName,
      tradeName,
      cnpj: normalizedCnpj,
      description,
      operatingHours,
      collectionType,
      acceptedLines: acceptedLines || acceptedMaterials || [],
      headquarters,
      collectionPoints
    });
  }

  /**
   * Busca coletor por ID
   */
  async getCollectorById(id) {
    const collector = await this.collectorRepo.findById(id);
    if (!collector) {
      throw this.createError('Coletor não encontrado', 404);
    }
    return collector;
  }

  /**
   * Lista todos os coletores
   */
  async listAllCollectors() {
    return this.collectorRepo.findAll();
  }

  /**
   * Busca coletores com filtros
   */
  async searchCollectors(filters) {
    const { city, state, line, material, collectionType, latitude, longitude, radius } = filters; // 'material' legado
    
    const where = {};
    
    if (line) {
      where.acceptedLines = { has: line };
    } else if (material) { // suporte legado
      where.acceptedLines = { has: material };
    }

    if (collectionType) {
      where.OR = [
        { collectionType },
        { collectionType: 'BOTH' }
      ];
    }
    
    // Buscar por localização da sede ou pontos de coleta
    if (city || state) {
      where.OR = [
        {
          headquarters: {
            ...(city && { city: { contains: city, mode: 'insensitive' } }),
            ...(state && { state: state.toUpperCase() })
          }
        },
        {
          collectionPoints: {
            some: {
              isActive: true,
              ...(city && { city: { contains: city, mode: 'insensitive' } }),
              ...(state && { state: state.toUpperCase() })
            }
          }
        }
      ];
    }

    let collectors = await this.collectorRepo.search(where);

    // Filtro por proximidade (considera sede e pontos de coleta)
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const rad = parseFloat(radius);
      
      collectors = collectors.map(c => {
        const nearbyPoints = c.collectionPoints.filter(point => {
          if (!point.latitude || !point.longitude) return false;
          const distance = this.calculateDistance(lat, lon, point.latitude, point.longitude);
          return distance <= rad;
        });

        const headquartersNearby = c.headquarters?.latitude && c.headquarters?.longitude &&
          this.calculateDistance(lat, lon, c.headquarters.latitude, c.headquarters.longitude) <= rad;

        return {
          ...c,
          collectionPoints: nearbyPoints,
          headquartersNearby
        };
      }).filter(c => c.headquartersNearby || c.collectionPoints.length > 0);
    }
    
    return collectors;
  }

  /**
   * Busca coletor pelo userId
   */
  async getCollectorByUserId(userId) {
    const collector = await this.collectorRepo.findByUserId(userId);
    if (!collector) {
      throw this.createError('Coletor não encontrado', 404);
    }
    return collector;
  }

  /**
   * Atualiza coletor
   */
  async updateCollector(id, data) {
    const { phone, companyName, tradeName, cnpj, description, operatingHours, collectionType, acceptedLines, acceptedMaterials, headquarters } = data;

    // Verifica se coletor existe
    const collector = await this.collectorRepo.findById(id);
    if (!collector) {
      throw this.createError('Coletor não encontrado', 404);
    }

    // Valida CNPJ se fornecido
    let normalizedCnpj = null;
    if (cnpj) {
      normalizedCnpj = onlyDigits(cnpj);
      if (!isValidCNPJ(normalizedCnpj)) {
        throw this.createError('CNPJ inválido');
      }
      const conflict = await this.collectorRepo.checkCnpjConflict(normalizedCnpj, id);
      if (conflict) {
        throw this.createError('CNPJ já cadastrado', 409);
      }
    }

    return this.collectorRepo.update(id, {
      phone,
      companyName,
      tradeName,
      cnpj: normalizedCnpj,
      description,
      operatingHours,
      collectionType,
      acceptedLines: acceptedLines || acceptedMaterials,
      headquarters
    });
  }

  /**
   * Retorna o userId dono do coletor
   */
  async getOwnerUserIdByCollectorId(collectorId) {
    const collector = await this.collectorRepo.findById(collectorId);
    if (!collector) {
      throw this.createError('Coletor não encontrado', 404);
    }
    return collector.userId;
  }

  /**
   * Retorna o userId dono do ponto de coleta
   */
  async getOwnerUserIdByCollectionPointId(collectionPointId) {
    const point = await this.collectorRepo.findCollectionPointById(collectionPointId);
    if (!point) {
      throw this.createError('Ponto de coleta não encontrado', 404);
    }
    const collector = await this.collectorRepo.findById(point.collectorId);
    if (!collector) {
      throw this.createError('Coletor não encontrado', 404);
    }
    return collector.userId;
  }

  /**
   * Deleta coletor
   */
  async deleteCollector(id) {
    return this.collectorRepo.delete(id);
  }

  /**
   * Cria ponto de coleta
   */
  async createCollectionPoint(collectorId, data) {
        const { name, description, addressName, number, additionalInfo, 
          neighborhood, postalCode, city, state, latitude, longitude, 
          operatingHours, acceptedLines, acceptedMaterials } = data;

    // Validar campos obrigatórios
    const required = ['name', 'addressName', 'number', 'neighborhood', 'postalCode', 'city', 'state'];
    this.validateRequiredFields(data, required);

    // Verifica se coletor existe
    const collector = await this.collectorRepo.findById(collectorId);
    if (!collector) {
      throw this.createError('Coletor não encontrado', 404);
    }

    return this.collectorRepo.createCollectionPoint({
      name,
      description,
      addressName,
      number,
      additionalInfo,
      neighborhood,
      postalCode,
      city,
      state,
      latitude,
      longitude,
      operatingHours,
      acceptedLines: acceptedLines || acceptedMaterials || [],
      collectorId
    });
  }

  /**
   * Atualiza ponto de coleta
   */
  async updateCollectionPoint(id, data) {
    const existingPoint = await this.collectorRepo.findCollectionPointById(id);
    if (!existingPoint) {
      throw this.createError('Ponto de coleta não encontrado', 404);
    }

    return this.collectorRepo.updateCollectionPoint(id, data);
  }

  /**
   * Deleta (soft delete) ponto de coleta
   */
  async deleteCollectionPoint(id) {
    const existingPoint = await this.collectorRepo.findCollectionPointById(id);
    if (!existingPoint) {
      throw this.createError('Ponto de coleta não encontrado', 404);
    }

    return this.collectorRepo.deleteCollectionPoint(id);
  }

  /**
   * Lista pontos de coleta de um coletor
   */
  async getCollectionPointsByCollector(collectorId) {
    return this.collectorRepo.findCollectionPointsByCollectorId(collectorId);
  }

  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
