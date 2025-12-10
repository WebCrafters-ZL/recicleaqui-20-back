import express from 'express';
import prisma from '../config/DatabaseManager.js';
import DiscardRepository from '../repositories/DiscardRepository.js';
import CollectorRepository from '../repositories/CollectorRepository.js';
import DiscardService from '../services/DiscardService.js';
import DiscardController from '../controllers/DiscardController.js';
import logger from '../utils/Logger.js';
import authRequired, { hasRole } from '../middlewares/AuthMiddleware.js';

const discardRepository = new DiscardRepository(prisma);
const collectorRepository = new CollectorRepository(prisma);
const discardService = new DiscardService(discardRepository, collectorRepository, prisma);
const discardController = new DiscardController(discardService);

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Registrar descarte
// Registrar descarte: CLIENT
router.post('/', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards chamada');
  return discardController.registerDiscard(req, res);
}));

// Listar pontos elegíveis (passar address no body e lines na query)
// Listar pontos elegíveis: público (pode ser sem auth)
router.post('/eligible-points', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/eligible-points chamada');
  return discardController.listEligiblePoints(req, res);
}));

// Coletores listam descartes pendentes pickup
// Coletores listam descartes pendentes: COLLECTOR
router.get('/pending-pickup/:collectorId', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info('Rota GET /discards/pending-pickup/:collectorId chamada');
  return discardController.listPendingPickupDiscardsForCollector(req, res);
}));

// Coletores listam descartes pendentes por distância
// Coletores listam descartes por distância: COLLECTOR
router.get('/nearby/:collectorId', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info('Rota GET /discards/nearby/:collectorId chamada');
  return discardController.listPendingPickupDiscardsByDistance(req, res);
}));

// Criar oferta
// Criar oferta: COLLECTOR
router.post('/:discardId/offers', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/:discardId/offers chamada');
  return discardController.createOffer(req, res);
}));

// Aceitar oferta
// Aceitar oferta: CLIENT
router.post('/offers/:offerId/accept', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/offers/:offerId/accept chamada');
  return discardController.acceptOffer(req, res);
}));

// Rejeitar oferta
// Rejeitar oferta: CLIENT
router.post('/offers/:offerId/reject', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/offers/:offerId/reject chamada');
  return discardController.rejectOffer(req, res);
}));

// Cancelar descarte
// Cancelar descarte: CLIENT
router.post('/:discardId/cancel', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/:discardId/cancel chamada');
  return discardController.cancelDiscard(req, res);
}));

// Concluir descarte
// Concluir descarte: COLLECTOR
router.post('/:discardId/complete', authRequired, hasRole('COLLECTOR'), asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/:discardId/complete chamada');
  return discardController.completeDiscard(req, res);
}));

export default router;
