import express from 'express';
import logger from '../utils/logger.js';
import * as collectorCtrl from '../controllers/collector.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Rotas de busca (devem vir antes de /:id para evitar conflito)
router.get('/search', asyncHandler(async (req, res) => {
    logger.info('Rota GET /collectors/search chamada');
    return collectorCtrl.searchCollectors(req, res);
}));

// CRUD de coletores
router.post('/', asyncHandler(async (req, res) => {
    logger.info('Rota POST /collectors chamada');
    return collectorCtrl.createCollector(req, res);
}));

router.get('/', asyncHandler(async (req, res) => {
    logger.info('Rota GET /collectors chamada');
    return collectorCtrl.listAllCollectors(req, res);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota GET /collectors/${req.params.id} chamada`);
    return collectorCtrl.getCollectorById(req, res);
}));

router.put('/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota PUT /collectors/${req.params.id} chamada`);
    return collectorCtrl.updateCollector(req, res);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota DELETE /collectors/${req.params.id} chamada`);
    return collectorCtrl.deleteCollector(req, res);
}));

// CRUD de pontos de coleta
router.get('/:collectorId/collection-points', asyncHandler(async (req, res) => {
    logger.info(`Rota GET /collectors/${req.params.collectorId}/collection-points chamada`);
    return collectorCtrl.getCollectionPointsByCollector(req, res);
}));

router.post('/:collectorId/collection-points', asyncHandler(async (req, res) => {
    logger.info(`Rota POST /collectors/${req.params.collectorId}/collection-points chamada`);
    return collectorCtrl.createCollectionPoint(req, res);
}));

router.put('/collection-points/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota PUT /collectors/collection-points/${req.params.id} chamada`);
    return collectorCtrl.updateCollectionPoint(req, res);
}));

router.delete('/collection-points/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota DELETE /collectors/collection-points/${req.params.id} chamada`);
    return collectorCtrl.deleteCollectionPoint(req, res);
}));

export default router;
