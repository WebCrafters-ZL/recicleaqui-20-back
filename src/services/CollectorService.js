import BaseService from '../core/BaseService.js';
import { hashPassword } from '../utils/HashUtils.js';
import { isValidEmail, isValidCNPJ, onlyDigits } from '../utils/Validators.js';
import { enrichAddressWithCoordinates } from '../utils/GeocodingUtils.js';

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

    // Geocodificar sede
    let enrichedHeadquarters = headquarters;
    if (headquarters) {
      enrichedHeadquarters = await enrichAddressWithCoordinates(headquarters);
    }

    // Geocodificar pontos de coleta
    let enrichedCollectionPoints = collectionPoints;
    if (collectionPoints && Array.isArray(collectionPoints)) {
      enrichedCollectionPoints = await Promise.all(
        collectionPoints.map(point => enrichAddressWithCoordinates(point))
      );
    }

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
      headquarters: enrichedHeadquarters,
      collectionPoints: enrichedCollectionPoints
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

    // Geocodificar sede se fornecida
    let enrichedHeadquarters = headquarters;
    if (headquarters) {
      enrichedHeadquarters = await enrichAddressWithCoordinates(headquarters);
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
      headquarters: enrichedHeadquarters
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

    // Geocodificar endereço do ponto de coleta
    const addressData = {
      addressName,
      number,
      additionalInfo,
      neighborhood,
      postalCode,
      city,
      state,
      latitude,
      longitude
    };
    const enrichedAddress = await enrichAddressWithCoordinates(addressData);

    return this.collectorRepo.createCollectionPoint({
      name,
      description,
      addressName: enrichedAddress.addressName,
      number: enrichedAddress.number,
      additionalInfo: enrichedAddress.additionalInfo,
      neighborhood: enrichedAddress.neighborhood,
      postalCode: enrichedAddress.postalCode,
      city: enrichedAddress.city,
      state: enrichedAddress.state,
      latitude: enrichedAddress.latitude,
      longitude: enrichedAddress.longitude,
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

    // Geocodificar endereço se algum campo de endereço foi fornecido
    let enrichedData = data;
    const hasAddressFields = data.addressName || data.number || data.additionalInfo || 
                             data.neighborhood || data.postalCode || data.city || data.state;
    if (hasAddressFields) {
      const addressData = {
        addressName: data.addressName || existingPoint.addressName,
        number: data.number || existingPoint.number,
        additionalInfo: data.additionalInfo || existingPoint.additionalInfo,
        neighborhood: data.neighborhood || existingPoint.neighborhood,
        postalCode: data.postalCode || existingPoint.postalCode,
        city: data.city || existingPoint.city,
        state: data.state || existingPoint.state,
        latitude: data.latitude || existingPoint.latitude,
        longitude: data.longitude || existingPoint.longitude
      };
      const enrichedAddress = await enrichAddressWithCoordinates(addressData);
      enrichedData = {
        ...data,
        latitude: enrichedAddress.latitude,
        longitude: enrichedAddress.longitude
      };
    }

    return this.collectorRepo.updateCollectionPoint(id, enrichedData);
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
