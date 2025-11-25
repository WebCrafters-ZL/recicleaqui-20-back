import express from 'express';
import prisma from '../config/DatabaseManager.js';
import DiscardRepository from '../repositories/DiscardRepository.js';
import CollectorRepository from '../repositories/CollectorRepository.js';
import DiscardService from '../services/DiscardService.js';
import DiscardController from '../controllers/DiscardController.js';
import logger from '../utils/Logger.js';

const discardRepository = new DiscardRepository(prisma);
const collectorRepository = new CollectorRepository(prisma);
const discardService = new DiscardService(discardRepository, collectorRepository, prisma);
const discardController = new DiscardController(discardService);

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Registrar descarte
router.post('/', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards chamada');
  return discardController.registerDiscard(req, res);
}));

// Listar pontos elegíveis (passar address no body e lines na query)
router.post('/eligible-points', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/eligible-points chamada');
  return discardController.listEligiblePoints(req, res);
}));

// Coletores listam descartes pendentes pickup
router.get('/pending-pickup/:collectorId', asyncHandler(async (req, res) => {
  logger.info('Rota GET /discards/pending-pickup/:collectorId chamada');
  return discardController.listPendingPickupDiscardsForCollector(req, res);
}));

// Criar oferta
router.post('/:discardId/offers', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/:discardId/offers chamada');
  return discardController.createOffer(req, res);
}));

// Aceitar oferta
router.post('/offers/:offerId/accept', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/offers/:offerId/accept chamada');
  return discardController.acceptOffer(req, res);
}));

// Rejeitar oferta
router.post('/offers/:offerId/reject', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/offers/:offerId/reject chamada');
  return discardController.rejectOffer(req, res);
}));

// Cancelar descarte
router.post('/:discardId/cancel', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/:discardId/cancel chamada');
  return discardController.cancelDiscard(req, res);
}));

// Concluir descarte
router.post('/:discardId/complete', asyncHandler(async (req, res) => {
  logger.info('Rota POST /discards/:discardId/complete chamada');
  return discardController.completeDiscard(req, res);
}));

export default router;
