import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/hash-utils.js";
import { isValidEmail, isValidCPF, isValidCNPJ, onlyDigits } from "../utils/validators.js";

export async function createIndividualClient(req, res) {
    const { email, password, phone, firstName, lastName, cpf, address } = req.body;

    if (!email || !password || !phone || !firstName || !lastName || !cpf) {
        throw Object.assign(new Error("Campos obrigatórios ausentes"), { status: 400 });
    }

        // Normaliza e valida (apenas dígitos)
        const normalizedCpf = onlyDigits(cpf);
        if (!isValidEmail(email)) throw Object.assign(new Error("Email inválido"), { status: 400 });
        if (!isValidCPF(normalizedCpf)) throw Object.assign(new Error("CPF inválido"), { status: 400 });

        // Verificações de unicidade: email e cpf (compara apenas os dígitos armazenados)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw Object.assign(new Error("Email já cadastrado"), { status: 409 });

        const [existingCpf] = await prisma.$queryRaw`
            SELECT id FROM "Individual" WHERE regexp_replace(cpf, '\\D', '', 'g') = ${normalizedCpf} LIMIT 1
        `;
        if (existingCpf) throw Object.assign(new Error("CPF já cadastrado"), { status: 409 });

    // Hash da senha e criar usuário e client dentro de uma transação
    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { email, password: hashedPassword } });

        const client = await tx.client.create({
            data: {
                type: "individual",
                phone,
                userId: user.id
            }
        });

        await tx.individual.create({
            data: {
                firstName,
                lastName,
                cpf: normalizedCpf,
                clientId: client.id
            }
        });

        if (address) {
            await tx.address.create({ data: { ...address, clientId: client.id } });
        }

        return { id: client.id, userId: user.id, type: client.type };
    });

    return res.status(201).json(result);
}

export async function createCompanyClient(req, res) {
    const { email, password, phone, companyName, tradeName, cnpj, address } = req.body;

    if (!email || !password || !phone || !companyName || !tradeName || !cnpj) {
        throw Object.assign(new Error("Campos obrigatórios ausentes"), { status: 400 });
    }

        // Normaliza e valida (apenas dígitos)
        const normalizedCnpj = onlyDigits(cnpj);
        if (!isValidEmail(email)) throw Object.assign(new Error("Email inválido"), { status: 400 });
        if (!isValidCNPJ(normalizedCnpj)) throw Object.assign(new Error("CNPJ inválido"), { status: 400 });

        // Verificações de unicidade: email e cnpj (compara apenas os dígitos armazenados)
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw Object.assign(new Error("Email já cadastrado"), { status: 409 });

        const [existingCnpj] = await prisma.$queryRaw`
            SELECT id FROM "Company" WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${normalizedCnpj} LIMIT 1
        `;
        if (existingCnpj) throw Object.assign(new Error("CNPJ já cadastrado"), { status: 409 });

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { email, password: hashedPassword } });

        const client = await tx.client.create({
            data: {
                type: "company",
                phone,
                userId: user.id
            }
        });

    await tx.company.create({ data: { companyName, tradeName, cnpj: normalizedCnpj, clientId: client.id } });

        if (address) {
            await tx.address.create({ data: { ...address, clientId: client.id } });
        }

        return { id: client.id, userId: user.id, type: client.type };
    });

    return res.status(201).json(result);
}

export async function getClientById(req, res) {
    const id = Number(req.params.id || req.query.id);
    if (!id || Number.isNaN(id)) throw Object.assign(new Error("ID inválido"), { status: 400 });

    const client = await prisma.client.findUnique({ where: { id }, include: { user: true, individual: true, company: true, address: true } });
    if (!client) throw Object.assign(new Error("Cliente não encontrado"), { status: 404 });
    return res.json(client);
}

export async function updateIndividualClient(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) throw Object.assign(new Error("ID inválido"), { status: 400 });

    const { phone, firstName, lastName, cpf, address } = req.body;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw Object.assign(new Error("Cliente não encontrado"), { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
        if (phone) await tx.client.update({ where: { id }, data: { phone, editedAt: new Date() } });

        if (firstName || lastName || cpf) {
            // Se cpf fornecido, validar formato e unicidade
            if (cpf) {
                const normalizedCpf = onlyDigits(cpf);
                if (!isValidCPF(normalizedCpf)) throw Object.assign(new Error("CPF inválido"), { status: 400 });
                const [other] = await tx.$queryRaw`
                  SELECT id, "clientId" FROM "Individual" WHERE regexp_replace(cpf, '\\D', '', 'g') = ${normalizedCpf} LIMIT 1
                `;
                if (other && other.clientId !== id) throw Object.assign(new Error("CPF já cadastrado"), { status: 409 });
                await tx.individual.update({
                    where: { clientId: id },
                    data: { ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}), cpf: normalizedCpf, editedAt: new Date() }
                });
            } else {
                await tx.individual.update({
                    where: { clientId: id },
                    data: { ...(firstName ? { firstName } : {}), ...(lastName ? { lastName } : {}), editedAt: new Date() }
                });
            }
        }

        if (address) {
            const existing = await tx.address.findUnique({ where: { clientId: id } }).catch(() => null);
            if (existing) await tx.address.update({ where: { clientId: id }, data: { ...address, editedAt: new Date() } });
            else await tx.address.create({ data: { ...address, clientId: id } });
        }

        return tx.client.findUnique({ where: { id }, include: { user: true, individual: true, address: true } });
    });

    return res.json(result);
}

export async function updateCompanyClient(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) throw Object.assign(new Error("ID inválido"), { status: 400 });

    const { phone, companyName, tradeName, cnpj, address } = req.body;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw Object.assign(new Error("Cliente não encontrado"), { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
        if (phone) await tx.client.update({ where: { id }, data: { phone, editedAt: new Date() } });

        if (companyName || tradeName || cnpj) {
            // Se cnpj fornecido, validar formato e unicidade
            if (cnpj) {
                const normalizedCnpj = onlyDigits(cnpj);
                if (!isValidCNPJ(normalizedCnpj)) throw Object.assign(new Error("CNPJ inválido"), { status: 400 });
                const [other] = await tx.$queryRaw`
                  SELECT id, "clientId" FROM "Company" WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${normalizedCnpj} LIMIT 1
                `;
                if (other && other.clientId !== id) throw Object.assign(new Error("CNPJ já cadastrado"), { status: 409 });
                await tx.company.update({
                    where: { clientId: id },
                    data: { ...(companyName ? { companyName } : {}), ...(tradeName ? { tradeName } : {}), cnpj: normalizedCnpj, editedAt: new Date() }
                });
            } else {
                await tx.company.update({
                    where: { clientId: id },
                    data: { ...(companyName ? { companyName } : {}), ...(tradeName ? { tradeName } : {}), editedAt: new Date() }
                });
            }
        }

        if (address) {
            const existing = await tx.address.findUnique({ where: { clientId: id } }).catch(() => null);
            if (existing) await tx.address.update({ where: { clientId: id }, data: { ...address, editedAt: new Date() } });
            else await tx.address.create({ data: { ...address, clientId: id } });
        }

        return tx.client.findUnique({ where: { id }, include: { user: true, company: true, address: true } });
    });

    return res.json(result);
}

export async function deleteClient(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) throw Object.assign(new Error("ID inválido"), { status: 400 });

    await prisma.client.delete({ where: { id } });

    return res.status(204).send();
}

export async function listAllClients(req, res) {
    const clients = await prisma.client.findMany({ include: { user: true, individual: true, company: true, address: true } });
    return res.json(clients);
}