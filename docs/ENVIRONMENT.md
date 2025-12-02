# Ambiente e Variáveis

Guia de configuração de ambiente para o RecicleAqui 2.0 Backend.

## Arquivos .env

- Desenvolvimento: `.env.development.local`
- Produção: `.env`

Scripts:
- `npm run dev` usa `.env.development.local`
- `npm start` usa `.env`
- `npm run migrate:dev` usa `.env.development.local`
- `npm run migrate:prod` usa `.env`
- `npm run migrate:status` usa `.env.development.local`

## Variáveis Principais

- `PORT`: porta do servidor (padrão `3000`)
- `DATABASE_URL`: conexão PostgreSQL, ex: `postgresql://usuario:senha@localhost:5432/recicleaqui`

### Autenticação (JWT)
- `JWT_SECRET`: segredo do token JWT
- `JWT_EXPIRES_IN`: expiração, ex: `1d`, `7d`

### CORS
- `FRONTEND_URL`: origem autorizada (padrão `http://localhost:5173`)

### Email/SMTP
- `USE_ETHEREAL`: `true` para usar conta de testes (Nodemailer)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: credenciais SMTP
- `EMAIL_FROM`: remetente padrão, ex: `no-reply@example.com`

### Proxy
- `TRUST_PROXY`: valor para `app.set('trust proxy')` (ex: `1`, `true`, `loopback`)

## Exemplos

```env
# .env.development.local
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/recicleaqui"
JWT_SECRET="seu-secret-jwt-super-seguro"
JWT_EXPIRES_IN="1d"
FRONTEND_URL="http://localhost:5173"
USE_ETHEREAL=true
EMAIL_FROM="no-reply@recicleaqui.local"
TRUST_PROXY=1
```

## Notas
- Em desenvolvimento, se `USE_ETHEREAL=true` ou SMTP não estiver configurado, o serviço de email usa automaticamente uma conta Ethereal e loga a URL de preview.
- Ajuste `TRUST_PROXY` conforme a infraestrutura (reverse proxy, container, etc.).
- Mantenha `JWT_SECRET` robusto. Gere com Node: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
