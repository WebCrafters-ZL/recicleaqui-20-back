# RecicleAqui 2.0 - Backend (Resumo)

Backend da aplicação RecicleAqui 2.0. Guia rápido com os passos mínimos para começar.

Pré-requisitos:
- Node.js 18+
- PostgreSQL (projeto usa Prisma)

Quick start:
```bash
git clone https://github.com/seu-usuario/recicleaqui-20-back.git
cd recicleaqui-20-back
npm install
# criar .env a partir do modelo
cp .env.example .env
# (opcional) criar .env.development.local
cp .env.example .env.development.local
npm run migrate:dev   # executar migrações em dev
npm run dev           # iniciar server em modo dev
```

Comandos principais:
- `npm run dev` — desenvolvimento (nodemon)
- `npm start` — produção
- `npm run migrate:dev` — migração local + gera client
- `npm run migrate:prod` — aplica migrações em produção
- `npx prisma generate` — gera client Prisma
- `npx prisma studio` — interface web para dados

Notas rápidas:
- Edite `.env` com as credenciais corretas (não commite `.env`).
- Há migrations no diretório `prisma/migrations` — revise antes de aplicar em produção.

---