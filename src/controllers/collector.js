import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/hash-utils.js";
import { isValidEmail, isValidCNPJ, onlyDigits } from "../utils/validators.js";

export async function createCollector(req, res) {
    const { 
        email, 
        password, 
        phone, 
        companyName, 
        tradeName, 
        cnpj, 
        description, 
        operatingHours,
        collectionType,
        acceptedMaterials, 
        headquarters,
        collectionPoints
    } = req.body;

    if (!email || !password || !phone || !companyName || !tradeName || !cnpj || !headquarters) {
        throw Object.assign(new Error("Campos obrigatórios ausentes"), { status: 400 });
    }

    // Validar collectionType
    if (collectionType && !['HOME_PICKUP', 'DROP_OFF_POINT', 'BOTH'].includes(collectionType)) {
        throw Object.assign(new Error("Tipo de coleta inválido"), { status: 400 });
    }

    // Se for DROP_OFF_POINT ou BOTH, deve ter pontos de coleta
    if ((collectionType === 'DROP_OFF_POINT' || collectionType === 'BOTH') && 
        (!collectionPoints || collectionPoints.length === 0)) {
        throw Object.assign(
            new Error("Pontos de coleta são obrigatórios para este tipo de operação"), 
            { status: 400 }
        );
    }

    const normalizedCnpj = onlyDigits(cnpj);
    if (!isValidEmail(email)) {
        throw Object.assign(new Error("Email inválido"), { status: 400 });
    }
    if (!isValidCNPJ(normalizedCnpj)) {
        throw Object.assign(new Error("CNPJ inválido"), { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw Object.assign(new Error("Email já cadastrado"), { status: 409 });
    }

    const [existingCnpj] = await prisma.$queryRaw`
        SELECT id FROM "Collector" WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${normalizedCnpj} LIMIT 1
    `;
    if (existingCnpj) {
        throw Object.assign(new Error("CNPJ já cadastrado"), { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ 
            data: { 
                email, 
                password: hashedPassword,
                role: "COLLECTOR"
            } 
        });

        const collector = await tx.collector.create({
            data: {
                companyName,
                tradeName,
                cnpj: normalizedCnpj,
                phone,
                description,
                operatingHours,
                collectionType: collectionType || 'BOTH',
                acceptedMaterials: acceptedMaterials || [],
                userId: user.id
            }
        });

        // Criar sede
        await tx.collectorHeadquarters.create({ 
            data: { 
                ...headquarters, 
                collectorId: collector.id 
            } 
        });

        // Criar pontos de coleta (se houver)
        if (collectionPoints && collectionPoints.length > 0) {
            await tx.collectionPoint.createMany({
                data: collectionPoints.map(point => ({
                    ...point,
                    collectorId: collector.id
                }))
            });
        }

        return { 
            id: collector.id, 
            userId: user.id, 
            email: user.email,
            role: user.role,
            collectionType: collector.collectionType
        };
    });

    return res.status(201).json(result);
}

export async function getCollectorById(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
        throw Object.assign(new Error("ID inválido"), { status: 400 });
    }

    const collector = await prisma.collector.findUnique({ 
        where: { id }, 
        include: { 
            user: { 
                select: { 
                    id: true, 
                    email: true, 
                    role: true, 
                    createdAt: true 
                } 
            }, 
            headquarters: true,
            collectionPoints: {
                where: { isActive: true }
            }
        } 
    });
    
    if (!collector) {
        throw Object.assign(new Error("Coletor não encontrado"), { status: 404 });
    }
    
    return res.json(collector);
}

export async function updateCollector(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
        throw Object.assign(new Error("ID inválido"), { status: 400 });
    }

    const { 
        phone, 
        companyName, 
        tradeName, 
        cnpj, 
        description, 
        operatingHours,
        collectionType,
        acceptedMaterials, 
        headquarters
    } = req.body;

    const collector = await prisma.collector.findUnique({ where: { id } });
    if (!collector) {
        throw Object.assign(new Error("Coletor não encontrado"), { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
        const updateData = {};
        if (phone) updateData.phone = phone;
        if (companyName) updateData.companyName = companyName;
        if (tradeName) updateData.tradeName = tradeName;
        if (description !== undefined) updateData.description = description;
        if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
        if (collectionType) updateData.collectionType = collectionType;
        if (acceptedMaterials) updateData.acceptedMaterials = acceptedMaterials;

        if (cnpj) {
            const normalizedCnpj = onlyDigits(cnpj);
            if (!isValidCNPJ(normalizedCnpj)) {
                throw Object.assign(new Error("CNPJ inválido"), { status: 400 });
            }
            
            const [other] = await tx.$queryRaw`
                SELECT id FROM "Collector" 
                WHERE regexp_replace(cnpj, '\\D', '', 'g') = ${normalizedCnpj} 
                AND id != ${id} 
                LIMIT 1
            `;
            if (other) {
                throw Object.assign(new Error("CNPJ já cadastrado"), { status: 409 });
            }
            updateData.cnpj = normalizedCnpj;
        }

        if (Object.keys(updateData).length > 0) {
            updateData.editedAt = new Date();
            await tx.collector.update({ where: { id }, data: updateData });
        }

        if (headquarters) {
            const existing = await tx.collectorHeadquarters.findUnique({ 
                where: { collectorId: id } 
            }).catch(() => null);
            
            if (existing) {
                await tx.collectorHeadquarters.update({ 
                    where: { collectorId: id }, 
                    data: { ...headquarters, editedAt: new Date() } 
                });
            } else {
                await tx.collectorHeadquarters.create({ 
                    data: { ...headquarters, collectorId: id } 
                });
            }
        }

        return tx.collector.findUnique({ 
            where: { id }, 
            include: { 
                user: { 
                    select: { 
                        id: true, 
                        email: true, 
                        role: true 
                    } 
                }, 
                headquarters: true,
                collectionPoints: {
                    where: { isActive: true }
                }
            } 
        });
    });

    return res.json(result);
}

export async function deleteCollector(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
        throw Object.assign(new Error("ID inválido"), { status: 400 });
    }

    await prisma.collector.delete({ where: { id } });
    return res.status(204).send();
}

export async function listAllCollectors(req, res) {
    const collectors = await prisma.collector.findMany({ 
        include: { 
            user: { 
                select: { 
                    id: true, 
                    email: true, 
                    role: true, 
                    createdAt: true 
                } 
            }, 
            headquarters: true,
            collectionPoints: {
                where: { isActive: true }
            }
        } 
    });
    return res.json(collectors);
}

export async function searchCollectors(req, res) {
    const { city, state, material, collectionType, latitude, longitude, radius } = req.query;
    
    const where = {};
    
    if (material) {
        where.acceptedMaterials = { has: material };
    }

    if (collectionType) {
        where.OR = [
            { collectionType },
            { collectionType: 'BOTH' }
        ];
    }
    
    // Buscar por localização da sede ou pontos de coleta
    if (city || state) {
        where.OR = [
            {
                headquarters: {
                    ...(city && { city: { contains: city, mode: 'insensitive' } }),
                    ...(state && { state: state.toUpperCase() })
                }
            },
            {
                collectionPoints: {
                    some: {
                        isActive: true,
                        ...(city && { city: { contains: city, mode: 'insensitive' } }),
                        ...(state && { state: state.toUpperCase() })
                    }
                }
            }
        ];
    }

    let collectors = await prisma.collector.findMany({
        where,
        include: { 
            user: { 
                select: { 
                    id: true, 
                    email: true, 
                    createdAt: true 
                } 
            }, 
            headquarters: true,
            collectionPoints: {
                where: { isActive: true }
            }
        }
    });

    // Filtro por proximidade (considera sede e pontos de coleta)
    if (latitude && longitude && radius) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const rad = parseFloat(radius);
        
        collectors = collectors.map(c => {
            const nearbyPoints = c.collectionPoints.filter(point => {
                if (!point.latitude || !point.longitude) return false;
                const distance = calculateDistance(lat, lon, point.latitude, point.longitude);
                return distance <= rad;
            });

            const headquartersNearby = c.headquarters?.latitude && c.headquarters?.longitude &&
                calculateDistance(lat, lon, c.headquarters.latitude, c.headquarters.longitude) <= rad;

            return {
                ...c,
                collectionPoints: nearbyPoints,
                headquartersNearby
            };
        }).filter(c => c.headquartersNearby || c.collectionPoints.length > 0);
    }
    
    return res.json(collectors);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ===== CRUD para Pontos de Coleta =====

export async function createCollectionPoint(req, res) {
    const collectorId = Number(req.params.collectorId);
    if (!collectorId || Number.isNaN(collectorId)) {
        throw Object.assign(new Error("ID do coletor inválido"), { status: 400 });
    }

    const collector = await prisma.collector.findUnique({ where: { id: collectorId } });
    if (!collector) {
        throw Object.assign(new Error("Coletor não encontrado"), { status: 404 });
    }

    const { name, description, addressType, addressName, number, additionalInfo, 
            neighborhood, postalCode, city, state, latitude, longitude, 
            operatingHours, acceptedMaterials } = req.body;

    if (!name || !addressType || !addressName || !number || !neighborhood || 
        !postalCode || !city || !state) {
        throw Object.assign(new Error("Campos obrigatórios ausentes"), { status: 400 });
    }

    const point = await prisma.collectionPoint.create({
        data: {
            name,
            description,
            addressType,
            addressName,
            number,
            additionalInfo,
            neighborhood,
            postalCode,
            city,
            state,
            latitude,
            longitude,
            operatingHours,
            acceptedMaterials: acceptedMaterials || [],
            collectorId
        }
    });

    return res.status(201).json(point);
}

export async function updateCollectionPoint(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
        throw Object.assign(new Error("ID inválido"), { status: 400 });
    }

    const existingPoint = await prisma.collectionPoint.findUnique({ where: { id } });
    if (!existingPoint) {
        throw Object.assign(new Error("Ponto de coleta não encontrado"), { status: 404 });
    }

    const point = await prisma.collectionPoint.update({
        where: { id },
        data: {
            ...req.body,
            editedAt: new Date()
        }
    });

    return res.json(point);
}

export async function deleteCollectionPoint(req, res) {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
        throw Object.assign(new Error("ID inválido"), { status: 400 });
    }

    const existingPoint = await prisma.collectionPoint.findUnique({ where: { id } });
    if (!existingPoint) {
        throw Object.assign(new Error("Ponto de coleta não encontrado"), { status: 404 });
    }

    // Soft delete
    await prisma.collectionPoint.update({
        where: { id },
        data: { isActive: false, editedAt: new Date() }
    });

    return res.status(204).send();
}

export async function getCollectionPointsByCollector(req, res) {
    const collectorId = Number(req.params.collectorId);
    if (!collectorId || Number.isNaN(collectorId)) {
        throw Object.assign(new Error("ID do coletor inválido"), { status: 400 });
    }

    const points = await prisma.collectionPoint.findMany({
        where: { 
            collectorId,
            isActive: true
        }
    });

    return res.json(points);
}
