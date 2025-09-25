import { Router } from 'express';
import * as clientController from '../controllers/client.js';
import { authenticateToken } from '../middlewares/auth.js';
import apiLimiter from '../middlewares/rate-limiter.js';

const router = Router();

router.post('/individual', apiLimiter, clientController.createIndividualClient);
router.post('/company', apiLimiter, clientController.createCompanyClient);
router.get('/:id', authenticateToken, clientController.getClientById);
router.put('/individual/:id', authenticateToken, clientController.updateIndividualClient);
router.put('/company/:id', authenticateToken, clientController.updateCompanyClient);
router.delete('/:id', authenticateToken, clientController.deleteClient);

// Rota administrativa para listar todos os clientes
router.get('/', authenticateToken, clientController.listAllClients);

export default router;