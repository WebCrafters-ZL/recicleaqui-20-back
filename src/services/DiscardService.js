import BaseService from '../core/BaseService.js';
import { areValidMaterialLines } from '../utils/Validators.js';

/**
 * DiscardService - Lógica de negócio para fluxo de descarte e ofertas de coleta
 */
export default class DiscardService extends BaseService {
  constructor(discardRepository, collectorRepository, prisma) {
    super();
    this.discardRepo = discardRepository;
    this.collectorRepo = collectorRepository; // para validar linhas aceitas e alcance
    this.prisma = prisma;
  }

  async getClientIdByUserId(userId) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw this.createError('Cliente não encontrado', 404);
    return client.id;
  }

  async getCollectorIdByUserId(userId) {
    const collector = await this.prisma.collector.findUnique({ where: { userId } });
    if (!collector) throw this.createError('Coletor não encontrado', 404);
    return collector.id;
  }

  async getCollectorOwnerUserId(collectorId) {
    const collector = await this.collectorRepo.findById(collectorId);
    if (!collector) throw this.createError('Coletor não encontrado', 404);
    return collector.userId;
  }

  /**
   * Registra novo descarte
   * mode: COLLECTION_POINT | PICKUP
   */
  async registerDiscard(clientId, data) {
    const { mode, lines, collectionPointId, description } = data;
    this.validateRequiredFields(data, ['mode', 'lines']);

    if (!['COLLECTION_POINT', 'PICKUP'].includes(mode)) {
      throw this.createError('Modo de descarte inválido');
    }
    if (!areValidMaterialLines(lines)) {
      throw this.createError('Linhas inválidas');
    }

    // COLLECTION_POINT: validar o ponto e se aceita todas as linhas
    if (mode === 'COLLECTION_POINT') {
      if (!collectionPointId) throw this.createError('collectionPointId obrigatório para COLLECTION_POINT');
      const point = await this.prisma.collectionPoint.findUnique({ where: { id: collectionPointId }, include: { collector: true } });
      if (!point || !point.isActive) throw this.createError('Ponto de coleta inválido ou inativo', 404);
      for (const l of lines) {
        if (!point.acceptedLines.includes(l)) {
          throw this.createError(`Ponto não aceita a linha ${l}`);
        }
      }
      return this.discardRepo.createDiscard({
        clientId,
        mode,
        lines,
        collectionPointId,
        description,
        status: 'PENDING'
      });
    }

    // PICKUP: apenas registra, ficará disponível para coletores que atendem o cliente
    return this.discardRepo.createDiscard({
      clientId,
      mode,
      lines,
      description,
      status: 'PENDING'
    });
  }

  /**
   * Lista pontos de coleta que aceitam todas as linhas e são próximos do endereço do cliente
   * Proximidade simplificada por mesma cidade/estado ou cálculo de distância se houver lat/long
   */
  async listEligibleCollectionPoints(clientAddress, lines, radiusKm = 20) {
    if (!clientAddress) throw this.createError('Endereço do cliente não fornecido');
    if (!areValidMaterialLines(lines)) throw this.createError('Linhas inválidas');

    const points = await this.discardRepo.findCollectionPointsAcceptingLines(lines);

    // Filtro por localização (mesma UF e cidade ou distância se disponíveis)
    const { city, state, latitude, longitude } = clientAddress;
    let filtered = points.filter(p =>
      p.city.toLowerCase().trim() === city.toLowerCase().trim() &&
      p.state === state
    );

    if (latitude && longitude) {
      filtered = filtered.filter(p => {
        if (!p.latitude || !p.longitude) return true; // mantém se não tem coords (fallback por cidade/estado)
        const d = this.calculateDistance(latitude, longitude, p.latitude, p.longitude);
        return d <= radiusKm;
      }).sort((a, b) => {
        const da = (a.latitude && a.longitude) ? this.calculateDistance(latitude, longitude, a.latitude, a.longitude) : Number.MAX_SAFE_INTEGER;
        const db = (b.latitude && b.longitude) ? this.calculateDistance(latitude, longitude, b.latitude, b.longitude) : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    }

    return filtered.map(p => ({
      id: p.id,
      name: p.name,
      addressName: p.addressName,
      number: p.number,
      neighborhood: p.neighborhood,
      postalCode: p.postalCode,
      city: p.city,
      state: p.state,
      latitude: p.latitude,
      longitude: p.longitude,
      acceptedLines: p.acceptedLines,
      collector: { id: p.collector.id, tradeName: p.collector.tradeName },
      distanceKm: latitude && longitude && p.latitude && p.longitude
        ? this.calculateDistance(latitude, longitude, p.latitude, p.longitude)
        : null,
    }));
  }

  /**
   * Coletores listam descartes elegíveis para enviar propostas (modo PICKUP e status PENDING)
   */
  async listPendingPickupDiscardsForCollector(collectorId) {
    const collector = await this.collectorRepo.findById(collectorId);
    if (!collector) throw this.createError('Coletor não encontrado', 404);

    const discards = await this.discardRepo.listDiscards({ mode: 'PICKUP', status: 'PENDING' }, { client: true });

    // Filtrar por linhas (coletor deve aceitar todas)
    return discards.filter(d => d.lines.every(l => collector.acceptedLines.includes(l)));
  }

  /**
   * Lista descartes pendentes de coleta ordenados por distância da sede do coletor
   * Retorna apenas descartes que o coletor aceita (por linhas de materiais) e que estão dentro do raio
   * @param {number} collectorId - ID do coletor
   * @param {number} radiusKm - Raio máximo em quilômetros (padrão: 15km)
   */
  async listPendingPickupDiscardsByDistance(collectorId, radiusKm = 15) {
    const collector = await this.collectorRepo.findById(collectorId);
    if (!collector) throw this.createError('Coletor não encontrado', 404);

    // Busca a sede do coletor (headquarters)
    const headquarters = await this.prisma.collectorHeadquarters.findUnique({
      where: { collectorId }
    });
    if (!headquarters) throw this.createError('Sede do coletor não encontrada', 404);

    // Busca todos os descartes PENDING em modo PICKUP
    const discards = await this.discardRepo.listDiscards(
      { mode: 'PICKUP', status: 'PENDING' },
      { client: { include: { address: true } } }
    );

    // Filtra por linhas (coletor deve aceitar todas)
    const filtered = discards.filter(d => d.lines.every(l => collector.acceptedLines.includes(l)));

    // Calcula distância e filtra por raio
    const withDistance = filtered
      .map(d => {
        let distance = null;
        if (d.client.address?.latitude && d.client.address?.longitude &&
          headquarters.latitude && headquarters.longitude) {
          distance = this.calculateDistance(
            headquarters.latitude,
            headquarters.longitude,
            d.client.address.latitude,
            d.client.address.longitude
          );
        }

        return {
          id: d.id,
          mode: d.mode,
          status: d.status,
          description: d.description,
          lines: d.lines,
          createdAt: d.createdAt,
          client: {
            name: d.client.individual
              ? `${d.client.individual.firstName} ${d.client.individual.lastName}`
              : d.client.company?.companyName || 'Cliente',
            phone: d.client.phone
          },
          address: {
            addressName: d.client.address?.addressName || '',
            number: d.client.address?.number || '',
            neighborhood: d.client.address?.neighborhood || '',
            postalCode: d.client.address?.postalCode || '',
            city: d.client.address?.city || '',
            state: d.client.address?.state || '',
            latitude: d.client.address?.latitude,
            longitude: d.client.address?.longitude
          },
          distanceFromHeadquarters: distance
        };
      })
      .filter(d => d.distanceFromHeadquarters === null || d.distanceFromHeadquarters <= radiusKm);
  }

  /**
   * Coletor envia oferta com slots propostos
   */
  async createOffer(collectorId, discardId, proposedSlots) {
    if (!Array.isArray(proposedSlots) || proposedSlots.length === 0) {
      throw this.createError('proposedSlots vazio');
    }
    // validar estrutura básica dos slots
    for (const slot of proposedSlots) {
      if (!slot.date || !slot.start || !slot.end) {
        throw this.createError('Slot inválido: requer date, start, end');
      }
    }

    const discard = await this.discardRepo.findById(discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    if (discard.mode !== 'PICKUP') throw this.createError('Ofertas permitidas apenas para PICKUP');
    if (discard.status !== 'PENDING') throw this.createError('Descarte não está disponível para oferta');

    const collector = await this.collectorRepo.findById(collectorId);
    if (!collector) throw this.createError('Coletor não encontrado', 404);
    if (!discard.lines.every(l => collector.acceptedLines.includes(l))) {
      throw this.createError('Coletor não aceita todas as linhas do descarte');
    }

    const offer = await this.discardRepo.createOffer({
      discardId,
      collectorId,
      proposedSlots,
      status: 'PENDING'
    });

    // Atualiza status do descarte para OFFERED
    await this.discardRepo.updateDiscard(discardId, { status: 'OFFERED' });

    return offer;
  }

  async acceptOffer(offerId, chosenSlotIndex) {
    const offer = await this.discardRepo.findOfferById(offerId);
    if (!offer) throw this.createError('Oferta não encontrada', 404);
    if (offer.status !== 'PENDING') throw this.createError('Oferta não está pendente');

    const slots = offer.proposedSlots;
    if (chosenSlotIndex < 0 || chosenSlotIndex >= slots.length) {
      throw this.createError('Índice de slot inválido');
    }

    // eslint-disable-next-line security/detect-object-injection -- chosen index é validado explicitamente
    const chosen = slots[chosenSlotIndex];
    await this.discardRepo.updateOffer(offerId, { status: 'ACCEPTED', acceptedSlot: chosen });
    await this.discardRepo.updateDiscard(offer.discardId, { status: 'SCHEDULED', scheduledSlot: chosen });

    return { offerId, acceptedSlot: chosen };
  }

  async rejectOffer(offerId) {
    const offer = await this.discardRepo.findOfferById(offerId);
    if (!offer) throw this.createError('Oferta não encontrada', 404);
    if (offer.status !== 'PENDING') throw this.createError('Oferta não está pendente');

    await this.discardRepo.updateOffer(offerId, { status: 'REJECTED' });
    // Retorna descarte para PENDING
    await this.discardRepo.updateDiscard(offer.discardId, { status: 'PENDING' });
    return { offerId, status: 'REJECTED' };
  }

  async cancelDiscard(discardId) {
    const discard = await this.discardRepo.findById(discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    if (discard.status === 'COMPLETED') throw this.createError('Não é possível cancelar descarte concluído');

    await this.discardRepo.updateDiscard(discardId, { status: 'CANCELLED' });
    return { discardId, status: 'CANCELLED' };
  }

  async completeDiscard(discardId) {
    const discard = await this.discardRepo.findById(discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    if (!['SCHEDULED', 'PENDING', 'OFFERED'].includes(discard.status)) {
      throw this.createError('Status do descarte não permite completar');
    }
    await this.discardRepo.updateDiscard(discardId, { status: 'COMPLETED' });
    return { discardId, status: 'COMPLETED' };
  }

  // Ownership-aware variants
  async acceptOfferOwnedByUser(offerId, chosenSlotIndex, userId) {
    const offer = await this.discardRepo.findOfferById(offerId);
    if (!offer) throw this.createError('Oferta não encontrada', 404);
    const discard = await this.discardRepo.findById(offer.discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    const client = await this.prisma.client.findUnique({ where: { id: discard.clientId } });
    if (!client || client.userId !== userId) {
      throw this.createError('Acesso negado', 403);
    }
    return this.acceptOffer(offerId, chosenSlotIndex);
  }

  async rejectOfferOwnedByUser(offerId, userId) {
    const offer = await this.discardRepo.findOfferById(offerId);
    if (!offer) throw this.createError('Oferta não encontrada', 404);
    const discard = await this.discardRepo.findById(offer.discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    const client = await this.prisma.client.findUnique({ where: { id: discard.clientId } });
    if (!client || client.userId !== userId) {
      throw this.createError('Acesso negado', 403);
    }
    return this.rejectOffer(offerId);
  }

  async cancelDiscardOwnedByUser(discardId, userId) {
    const discard = await this.discardRepo.findById(discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    const client = await this.prisma.client.findUnique({ where: { id: discard.clientId } });
    if (!client || client.userId !== userId) {
      throw this.createError('Acesso negado', 403);
    }
    return this.cancelDiscard(discardId);
  }

  async completeDiscardOwnedByCollector(discardId, collectorUserId) {
    const discard = await this.discardRepo.findById(discardId);
    if (!discard) throw this.createError('Descarte não encontrado', 404);
    // Verifica se há oferta aceita deste coletor
    const offers = await this.prisma.offer.findMany({ where: { discardId, status: 'ACCEPTED' } });
    if (offers.length === 0) {
      throw this.createError('Nenhuma oferta aceita para este descarte', 400);
    }
    // Verifica ownership do coletor
    const collector = await this.collectorRepo.findById(offers[0].collectorId);
    if (!collector || collector.userId !== collectorUserId) {
      throw this.createError('Acesso negado', 403);
    }
    return this.completeDiscard(discardId);
  }

  // Utilidade distance (reuso de haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
