import express from 'express';
import logger from '../utils/Logger.js';
import authRequired, { hasRole } from '../middlewares/AuthMiddleware.js';
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

// Rota /me para coletor autenticado
router.get('/me', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info('Rota GET /collectors/me chamada');
  return collectorController.getAuthenticatedCollector(req, res);
}));

// CRUD de coletores
// Criação de coletor (pode ser pública, mas a gestão pós-criação será restrita a COLLECTOR)
router.post('/', asyncHandler(async (req, res) => {
  logger.info('Rota POST /collectors chamada');
  return collectorController.createCollector(req, res);
}));

// Listagem pública
router.get('/', asyncHandler(async (req, res) => {
  logger.info('Rota GET /collectors chamada');
  return collectorController.listAllCollectors(req, res);
}));

// Consulta pública de um coletor
router.get('/:id', asyncHandler(async (req, res) => {
  logger.info(`Rota GET /collectors/${req.params.id} chamada`);
  return collectorController.getCollectorById(req, res);
}));

// Atualização restrita a COLLECTOR
router.put('/:id', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /collectors/${req.params.id} chamada`);
  return collectorController.updateCollector(req, res);
}));

// Exclusão restrita a COLLECTOR
router.delete('/:id', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info(`Rota DELETE /collectors/${req.params.id} chamada`);
  return collectorController.deleteCollector(req, res);
}));

// CRUD de pontos de coleta
// Listagem de pontos pode ser pública
router.get('/:collectorId/collection-points', asyncHandler(async (req, res) => {
  logger.info(`Rota GET /collectors/${req.params.collectorId}/collection-points chamada`);
  return collectorController.getCollectionPointsByCollector(req, res);
}));

// Criação de ponto de coleta restrita a COLLECTOR
router.post('/:collectorId/collection-points', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info(`Rota POST /collectors/${req.params.collectorId}/collection-points chamada`);
  return collectorController.createCollectionPoint(req, res);
}));

// Atualização de ponto restrita a COLLECTOR
router.put('/collection-points/:id', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /collectors/collection-points/${req.params.id} chamada`);
  return collectorController.updateCollectionPoint(req, res);
}));

// Exclusão de ponto restrita a COLLECTOR
router.delete('/collection-points/:id', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info(`Rota DELETE /collectors/collection-points/${req.params.id} chamada`);
  return collectorController.deleteCollectionPoint(req, res);
}));

export default router;
