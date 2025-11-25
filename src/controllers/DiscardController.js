import BaseController from '../core/BaseController.js';

export default class DiscardController extends BaseController {
  constructor(discardService) {
    super();
    this.discardService = discardService;

    this.registerDiscard = this.registerDiscard.bind(this);
    this.listEligiblePoints = this.listEligiblePoints.bind(this);
    this.listPendingPickupDiscardsForCollector = this.listPendingPickupDiscardsForCollector.bind(this);
    this.createOffer = this.createOffer.bind(this);
    this.acceptOffer = this.acceptOffer.bind(this);
    this.rejectOffer = this.rejectOffer.bind(this);
    this.cancelDiscard = this.cancelDiscard.bind(this);
    this.completeDiscard = this.completeDiscard.bind(this);
  }

  async registerDiscard(req, res) {
    // TODO: usar auth para obter clientId (req.user.id)
    const clientId = req.body.clientId; // provisório
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
    const discards = await this.discardService.listPendingPickupDiscardsForCollector(collectorId);
    return res.json(discards);
  }

  async createOffer(req, res) {
    const collectorId = req.body.collectorId; // provisório, vir do auth
    const discardId = this.validateId(req.params.discardId, 'discardId');
    const { proposedSlots } = req.body;
    const offer = await this.discardService.createOffer(collectorId, discardId, proposedSlots);
    return res.status(201).json(offer);
  }

  async acceptOffer(req, res) {
    const offerId = this.validateId(req.params.offerId, 'offerId');
    const { chosenSlotIndex } = req.body;
    const result = await this.discardService.acceptOffer(offerId, chosenSlotIndex);
    return res.json(result);
  }

  async rejectOffer(req, res) {
    const offerId = this.validateId(req.params.offerId, 'offerId');
    const result = await this.discardService.rejectOffer(offerId);
    return res.json(result);
  }

  async cancelDiscard(req, res) {
    const discardId = this.validateId(req.params.discardId, 'discardId');
    const result = await this.discardService.cancelDiscard(discardId);
    return res.json(result);
  }

  async completeDiscard(req, res) {
    const discardId = this.validateId(req.params.discardId, 'discardId');
    const result = await this.discardService.completeDiscard(discardId);
    return res.json(result);
  }
}
