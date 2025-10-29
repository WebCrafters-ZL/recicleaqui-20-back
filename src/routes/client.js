import express from 'express';
import logger from '../utils/logger.js';
import * as clientCtrl from '../controllers/client.js';

const router = express.Router();

// Simple async handler to forward errors to the central error handler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/individual', asyncHandler(async (req, res) => {
    logger.info('Rota POST /clients/individual chamada');
    return clientCtrl.createIndividualClient(req, res);
}));

router.post('/company', asyncHandler(async (req, res) => {
    logger.info('Rota POST /clients/company chamada');
    return clientCtrl.createCompanyClient(req, res);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota GET /clients/${req.params.id} chamada`);
    return clientCtrl.getClientById(req, res);
}));

router.put('/individual/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota PUT /clients/individual/${req.params.id} chamada`);
    return clientCtrl.updateIndividualClient(req, res);
}));

router.put('/company/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota PUT /clients/company/${req.params.id} chamada`);
    return clientCtrl.updateCompanyClient(req, res);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    logger.info(`Rota DELETE /clients/${req.params.id} chamada`);
    return clientCtrl.deleteClient(req, res);
}));

// Admin: list all
router.get('/', asyncHandler(async (req, res) => {
    logger.info('Rota GET /clients chamada');
    return clientCtrl.listAllClients(req, res);
}));

export default router;
