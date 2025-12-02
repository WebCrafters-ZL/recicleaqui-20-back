import BaseController from '../core/BaseController.js';

/**
 * CollectorController - Gerencia requisições relacionadas a coletores
 */
export default class CollectorController extends BaseController {
  constructor(collectorService) {
    super();
    this.collectorService = collectorService;
    
    // Bind methods
    this.createCollector = this.createCollector.bind(this);
    this.getCollectorById = this.getCollectorById.bind(this);
    this.updateCollector = this.updateCollector.bind(this);
    this.deleteCollector = this.deleteCollector.bind(this);
    this.listAllCollectors = this.listAllCollectors.bind(this);
    this.searchCollectors = this.searchCollectors.bind(this);
    this.createCollectionPoint = this.createCollectionPoint.bind(this);
    this.updateCollectionPoint = this.updateCollectionPoint.bind(this);
    this.deleteCollectionPoint = this.deleteCollectionPoint.bind(this);
    this.getCollectionPointsByCollector = this.getCollectionPointsByCollector.bind(this);
  }

  async createCollector(req, res) {
    const result = await this.collectorService.createCollector(req.body);
    return res.status(201).json(result);
  }

  async getCollectorById(req, res) {
    const id = this.validateId(req.params.id);
    const collector = await this.collectorService.getCollectorById(id);
    return res.json(collector);
  }

  async updateCollector(req, res) {
    const id = this.validateId(req.params.id);
    // Ownership: apenas o coletor dono do perfil pode alterar
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const ownerUserId = await this.collectorService.getOwnerUserIdByCollectorId(id);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    const result = await this.collectorService.updateCollector(id, req.body);
    return res.json(result);
  }

  async deleteCollector(req, res) {
    const id = this.validateId(req.params.id);
    // Ownership: apenas o coletor dono do perfil pode excluir
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const ownerUserId = await this.collectorService.getOwnerUserIdByCollectorId(id);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    await this.collectorService.deleteCollector(id);
    return res.status(204).send();
  }

  async listAllCollectors(req, res) {
    const collectors = await this.collectorService.listAllCollectors();
    return res.json(collectors);
  }

  async searchCollectors(req, res) {
    const collectors = await this.collectorService.searchCollectors(req.query);
    return res.json(collectors);
  }

  async createCollectionPoint(req, res) {
    const collectorId = this.validateId(req.params.collectorId, 'ID do coletor');
    // Ownership: apenas o coletor dono pode criar ponto para seu perfil
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const ownerUserId = await this.collectorService.getOwnerUserIdByCollectorId(collectorId);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    const point = await this.collectorService.createCollectionPoint(collectorId, req.body);
    return res.status(201).json(point);
  }

  async updateCollectionPoint(req, res) {
    const id = this.validateId(req.params.id);
    // Ownership: apenas o coletor dono do ponto pode alterar
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const ownerUserId = await this.collectorService.getOwnerUserIdByCollectionPointId(id);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    const point = await this.collectorService.updateCollectionPoint(id, req.body);
    return res.json(point);
  }

  async deleteCollectionPoint(req, res) {
    const id = this.validateId(req.params.id);
    // Ownership: apenas o coletor dono do ponto pode excluir
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const ownerUserId = await this.collectorService.getOwnerUserIdByCollectionPointId(id);
    if (ownerUserId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    await this.collectorService.deleteCollectionPoint(id);
    return res.status(204).send();
  }

  async getCollectionPointsByCollector(req, res) {
    const collectorId = this.validateId(req.params.collectorId, 'ID do coletor');
    const points = await this.collectorService.getCollectionPointsByCollector(collectorId);
    return res.json(points);
  }
}
