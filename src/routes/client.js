import express from 'express';
import logger from '../utils/Logger.js';
import authRequired from '../middlewares/AuthMiddleware.js';
import prisma from '../config/DatabaseManager.js';

// Importar classes
import ClientRepository from '../repositories/ClientRepository.js';
import ClientService from '../services/ClientService.js';
import ClientController from '../controllers/ClientController.js';

// Instanciar dependências
const clientRepository = new ClientRepository(prisma);
const clientService = new ClientService(clientRepository);
const clientController = new ClientController(clientService);

const router = express.Router();

// Async handler to forward errors to the central error handler
const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/individual', asyncHandler(async (req, res) => {
  logger.info('Rota POST /clients/individual chamada');
  return clientController.createIndividualClient(req, res);
}));


router.post('/company', asyncHandler(async (req, res) => {
  logger.info('Rota POST /clients/company chamada');
  return clientController.createCompanyClient(req, res);
}));

// Rota para obter dados do cliente logado
router.get('/me', authRequired, asyncHandler(async (req, res) => {
  logger.info('Rota GET /clients/me chamada');
  return clientController.getMe(req, res);
}));

// Rota para obter cliente por ID (autenticado)
router.get('/:id', authRequired, asyncHandler(async (req, res) => {
  logger.info(`Rota GET /clients/${req.params.id} chamada`);
  return clientController.getClientById(req, res);
}));

router.put('/individual/:id', authRequired, asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /clients/individual/${req.params.id} chamada`);
  return clientController.updateIndividualClient(req, res);
}));

router.put('/company/:id', authRequired, asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /clients/company/${req.params.id} chamada`);
  return clientController.updateCompanyClient(req, res);
}));

// Rota para alteração de senha do cliente autenticado
router.put('/password', authRequired, asyncHandler(async (req, res) => {
  logger.info('Rota PUT /clients/password chamada');
  return clientController.changePassword(req, res);
}));

router.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  logger.info(`Rota DELETE /clients/${req.params.id} chamada`);
  return clientController.deleteClient(req, res);
}));

// Admin: list all
router.get('/', asyncHandler(async (req, res) => {
  logger.info('Rota GET /clients chamada');
  return clientController.listAllClients(req, res);
}));

export default router;
