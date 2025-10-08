import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import logger from "../utils/logger.js"; // ajuste o caminho se necessário

export async function createIndividualClient(req, res) {
    logger.info('Rota createIndividualClient chamada');
    res.status(501).json({ error: 'Não implementado' });
}

export async function createCompanyClient(req, res) {
    logger.info('Rota createCompanyClient chamada');
    res.status(501).json({ error: 'Não implementado' });
}

export async function getClientById(req, res) {
    logger.info('Rota getClientById chamada');
    res.status(501).json({ error: 'Não implementado' });
}

export async function updateIndividualClient(req, res) {
    logger.info('Rota updateIndividualClient chamada');
    res.status(501).json({ error: 'Não implementado' });
}

export async function updateCompanyClient(req, res) {
    logger.info('Rota updateCompanyClient chamada');
    res.status(501).json({ error: 'Não implementado' });
}

export async function deleteClient(req, res) {
    logger.info('Rota deleteClient chamada');
    res.status(501).json({ error: 'Não implementado' });
}

// Funções adicionais para uso administrativo (ex.: listar todos os clientes)

export async function listAllClients(req, res) {
    logger.info('Rota listAllClients chamada');
    res.status(501).json({ error: 'Não implementado' });
}
