import express from 'express';
import logger from '../utils/Logger.js';
import authRequired, { hasRole } from '../middlewares/AuthMiddleware.js';
import prisma from '../config/DatabaseManager.js';

// Importar classes
import ClientRepository from '../repositories/ClientRepository.js';
import ClientService from '../services/ClientService.js';
import ClientController from '../controllers/ClientController.js';
import * as UploadMiddleware from '../middlewares/UploadMiddleware.js';
import { RateLimiterMiddleware } from '../middlewares/RateLimiterMiddleware.js';

// Instanciar dependências
const clientRepository = new ClientRepository(prisma);
const clientService = new ClientService(clientRepository);
const clientController = new ClientController(clientService);

const router = express.Router();

// Async handler to forward errors to the central error handler
const asyncHandler = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Cadastro de cliente (público)
router.post('/individual', asyncHandler(async (req, res) => {
  logger.info('Rota POST /clients/individual chamada');
  return clientController.createIndividualClient(req, res);
}));


// Cadastro de cliente (público)
router.post('/company', asyncHandler(async (req, res) => {
  logger.info('Rota POST /clients/company chamada');
  return clientController.createCompanyClient(req, res);
}));

// Rota para obter dados do cliente logado
// Somente CLIENT pode consultar seus dados
router.get('/me', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info('Rota GET /clients/me chamada');
  return clientController.getMe(req, res);
}));

// Rota para obter cliente por ID (autenticado)
// Somente CLIENT autenticado pode consultar clientes (pode ser restrito ao próprio ID)
router.get('/:id', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info(`Rota GET /clients/${req.params.id} chamada`);
  return clientController.getClientById(req, res);
}));

router.put('/individual/:id', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /clients/individual/${req.params.id} chamada`);
  return clientController.updateIndividualClient(req, res);
}));

router.put('/company/:id', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info(`Rota PUT /clients/company/${req.params.id} chamada`);
  return clientController.updateCompanyClient(req, res);
}));

// Rota para alteração de senha do cliente autenticado
router.put('/password', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info('Rota PUT /clients/password chamada');
  return clientController.changePassword(req, res);
}));

router.delete('/:id', authRequired, hasRole('CLIENT'), asyncHandler(async (req, res) => {
  logger.info(`Rota DELETE /clients/${req.params.id} chamada`);
  return clientController.deleteClient(req, res);
}));

// Admin: list all
// Listagem geral pode ser pública ou reservada a ADMIN; aqui restringimos a ADMIN
router.get('/', authRequired, hasRole('ADMIN'), asyncHandler(async (req, res) => {
  logger.info('Rota GET /clients chamada');
  return clientController.listAllClients(req, res);
}));

// Rota para solicitar o envio do código de redefinição de senha
router.post('/request-password-reset', clientController.requestPasswordReset);

// Upload de avatar
// Rate limit específico para upload (3 uploads a cada 10 min)
const uploadLimiter = RateLimiterMiddleware.creation({ windowMs: 10 * 60 * 1000, max: 3 });

router.post('/:id/avatar', authRequired, hasRole('CLIENT'), uploadLimiter, UploadMiddleware.uploadAvatarSingle, asyncHandler(async (req, res) => {
  return clientController.uploadAvatar(req, res);
}));

export default router;
