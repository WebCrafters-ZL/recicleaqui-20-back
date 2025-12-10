import BaseController from '../core/BaseController.js';

export default class DiscardController extends BaseController {
  constructor(discardService) {
    super();
    this.discardService = discardService;

    this.registerDiscard = this.registerDiscard.bind(this);
    this.listEligiblePoints = this.listEligiblePoints.bind(this);
    this.listPendingPickupDiscardsForCollector = this.listPendingPickupDiscardsForCollector.bind(this);
    this.listPendingPickupDiscardsByDistance = this.listPendingPickupDiscardsByDistance.bind(this);
    this.createOffer = this.createOffer.bind(this);
    this.acceptOffer = this.acceptOffer.bind(this);
    this.rejectOffer = this.rejectOffer.bind(this);
    this.cancelDiscard = this.cancelDiscard.bind(this);
    this.completeDiscard = this.completeDiscard.bind(this);
  }

  async registerDiscard(req, res) {
    // Ownership: clientId deve vir do usuário autenticado
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const clientId = await this.discardService.getClientIdByUserId(parseInt(req.user.id, 10));
    const result = await this.discardService.registerDiscard(clientId, req.body);
    return res.status(201).json(result);
  }

  async listEligiblePoints(req, res) {
    const { lines } = req.query; // linhas separadas por vírgula
    const clientAddress = req.body.address || req.body.clientAddress; // provisório
    const listLines = Array.isArray(lines) ? lines : String(lines || '').split(',').filter(Boolean);
    const points = await this.discardService.listEligibleCollectionPoints(clientAddress, listLines);
    return res.json(points);
  }

  async listPendingPickupDiscardsForCollector(req, res) {
    const collectorId = this.validateId(req.params.collectorId, 'collectorId');
    // Ownership: coletor só pode listar os seus
    const ownerUserId = await this.discardService.getCollectorOwnerUserId(collectorId);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    const discards = await this.discardService.listPendingPickupDiscardsForCollector(collectorId);
    return res.json(discards);
  }

  async listPendingPickupDiscardsByDistance(req, res) {
    const collectorId = this.validateId(req.params.collectorId, 'collectorId');
    // Ownership: coletor só pode listar os seus
    const ownerUserId = await this.discardService.getCollectorOwnerUserId(collectorId);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    const radiusKm = req.query.radius ? parseFloat(req.query.radius) : 15;
    const discards = await this.discardService.listPendingPickupDiscardsByDistance(collectorId, radiusKm);
    return res.json(discards);
  }

  async createOffer(req, res) {
    // Ownership: coletorId deve vir do usuário autenticado
    const collectorId = await this.discardService.getCollectorIdByUserId(parseInt(req.user.id, 10));
    const discardId = this.validateId(req.params.discardId, 'discardId');
    const { proposedSlots } = req.body;
    const offer = await this.discardService.createOffer(collectorId, discardId, proposedSlots);
    return res.status(201).json(offer);
  }

  async acceptOffer(req, res) {
    const offerId = this.validateId(req.params.offerId, 'offerId');
    const { chosenSlotIndex } = req.body;
    // Ownership: somente o cliente dono do descarte desta oferta pode aceitar
    const clientUserId = parseInt(req.user?.id || '0', 10);
    if (!clientUserId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const result = await this.discardService.acceptOfferOwnedByUser(offerId, chosenSlotIndex, clientUserId);
    return res.json(result);
  }

  async rejectOffer(req, res) {
    const offerId = this.validateId(req.params.offerId, 'offerId');
    // Ownership: somente o cliente dono pode rejeitar
    const clientUserId = parseInt(req.user?.id || '0', 10);
    if (!clientUserId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const result = await this.discardService.rejectOfferOwnedByUser(offerId, clientUserId);
    return res.json(result);
  }

  async cancelDiscard(req, res) {
    const discardId = this.validateId(req.params.discardId, 'discardId');
    // Ownership: somente o cliente dono pode cancelar
    const clientUserId = parseInt(req.user?.id || '0', 10);
    if (!clientUserId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const result = await this.discardService.cancelDiscardOwnedByUser(discardId, clientUserId);
    return res.json(result);
  }

  async completeDiscard(req, res) {
    const discardId = this.validateId(req.params.discardId, 'discardId');
    // Ownership: somente o coletor designado pode concluir
    const collectorUserId = parseInt(req.user?.id || '0', 10);
    if (!collectorUserId) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const result = await this.discardService.completeDiscardOwnedByCollector(discardId, collectorUserId);
    return res.json(result);
  }
}
