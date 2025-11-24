import express from 'express';
import logger from '../utils/Logger.js';
import prisma from '../config/DatabaseManager.js';

// Importar classes
import CollectorRepository from '../repositories/CollectorRepository.js';
import CollectorService from '../services/CollectorService.js';
import CollectorController from '../controllers/CollectorController.js';

// Instanciar dependências
const collectorRepository = new CollectorRepository(prisma);
const collectorService = new CollectorService(collectorRepository);
const collectorController = new CollectorController(collectorService);

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Rotas de busca (devem vir antes de /:id para evitar conflito)
router.get('/search', asyncHandler(async (req, res) => {
  logger.info('Rota GET /collectors/search chamada');
  return collectorController.searchCollectors(req, res);
}));

// CRUD de coletores
router.post('/', asyncHandler(async (req, res) => {
  logger.info('Rota POST /collectors chamada');
  return collectorController.createCollector(req, res);
}));

router.get('/', asyncHandler(async (req, res) => {
  logger.info('Rota GET /collectors chamada');
  return collectorController.listAllCollectors(req, res);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  logger.info(`Rota GET /collectors/${req.params.id} chamada`);
  return collectorController.getCollectorById(req, res);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /collectors/${req.params.id} chamada`);
  return collectorController.updateCollector(req, res);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  logger.info(`Rota DELETE /collectors/${req.params.id} chamada`);
  return collectorController.deleteCollector(req, res);
}));

// CRUD de pontos de coleta
router.get('/:collectorId/collection-points', asyncHandler(async (req, res) => {
  logger.info(`Rota GET /collectors/${req.params.collectorId}/collection-points chamada`);
  return collectorController.getCollectionPointsByCollector(req, res);
}));

router.post('/:collectorId/collection-points', asyncHandler(async (req, res) => {
  logger.info(`Rota POST /collectors/${req.params.collectorId}/collection-points chamada`);
  return collectorController.createCollectionPoint(req, res);
}));

router.put('/collection-points/:id', asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /collectors/collection-points/${req.params.id} chamada`);
  return collectorController.updateCollectionPoint(req, res);
}));

router.delete('/collection-points/:id', asyncHandler(async (req, res) => {
  logger.info(`Rota DELETE /collectors/collection-points/${req.params.id} chamada`);
  return collectorController.deleteCollectionPoint(req, res);
}));

export default router;
