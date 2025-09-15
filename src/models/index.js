import { Sequelize } from 'sequelize';
import configFile from '../../config/db.js';
import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const cfg = configFile[env];

if (!cfg) throw new Error(`DB config for env "${env}" not found`);

const sequelize = cfg.url
    ? new Sequelize(cfg.url, { dialect: cfg.dialect })
    : new Sequelize(cfg.database, cfg.username, cfg.password, {
        host: cfg.host,
        port: cfg.port,
        dialect: cfg.dialect,
    });

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexão com o banco de dados foi estabelecida com sucesso.");
    } catch (error) {
        console.error("Não foi possível conectar ao banco de dados:", error);
    }

    const models = {};
    const basename = path.basename(__filename);
    const files = fs.readdirSync(__dirname)
        .filter(f => f !== basename && f.endsWith('.js'));

    for (const file of files) {
        const imported = await import(path.join(__dirname, file));
        const model = imported.default(sequelize);
        models[model.name] = model;
    }

    Object.values(models).forEach((m) => { if (m.associate) m.associate(models); });

    // Export models after initialization
    module.exports = { sequelize, Sequelize, models };
})();