# RecicleAqui 2.0 - Backend

API REST para a aplicação RecicleAqui 2.0 - plataforma que conecta geradores de resíduos recicláveis com empresas de coleta e reciclagem.

## 🎯 Sobre o Projeto

RecicleAqui 2.0 é uma plataforma que facilita o processo de reciclagem, conectando:
- **Clientes** (pessoas físicas ou jurídicas) que desejam descartar materiais recicláveis
- **Coletores** (empresas de reciclagem) que oferecem serviços de coleta domiciliar ou pontos de coleta

### Características Principais

- Autenticação JWT com diferentes níveis de acesso (CLIENT, COLLECTOR, ADMIN)
- Cadastro completo de clientes (PF e PJ) com validação de CPF/CNPJ
- Cadastro de coletores com sede e múltiplos pontos de coleta
- **Geocodificação automática de endereços** usando API Nominatim (OpenStreetMap)
- Busca de coletores por localização e materiais aceitos
- Sistema de logs estruturado com Winston
- Rate limiting e proteção contra abuso de requisições
- Validação robusta de dados de entrada

## 🚀 Tecnologias

- **[Node.js](https://nodejs.org/)** 18+ - Runtime JavaScript
- **[Express](https://expressjs.com/)** 5.1 - Framework web
- **[Prisma](https://www.prisma.io/)** 7.0 - ORM para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** 9.0 - Autenticação baseada em tokens
- **[Bcrypt](https://www.npmjs.com/package/bcryptjs)** 3.0 - Hash de senhas
- **[Nodemailer](https://nodemailer.com/)** 6.9 - Envio de emails
- **[Helmet](https://helmetjs.github.io/)** 8.1 - Segurança de headers HTTP
- **[Winston](https://github.com/winstonjs/winston)** 3.18 - Sistema de logs
- **[ESLint](https://eslint.org/)** 9.39 - Linter e formatação de código

## 📦 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn

## 🚀 Início Rápido

### 1. Instalação

```bash
# Clone o repositório (fork)
git clone https://github.com/WebCrafters-ZL/recicleaqui-20-back.git
cd recicleaqui-20-back

# Instale as dependências
npm install
```

### 2. Configuração

```bash
# Copie o arquivo de exemplo para desenvolvimento
cp .env.example .env.development.local

# Edite o .env.development.local com suas configurações
DATABASE_URL="postgresql://usuario:senha@localhost:5432/recicleaqui"
JWT_SECRET="seu-secret-jwt-super-seguro"
PORT=3000
USE_ETHEREAL=true
```

Notas de ambiente:
- `npm run dev` usa `.env.development.local`
- `npm start` usa `.env`

### 3. Banco de Dados

```bash
# Execute as migrations (dev)
npm run migrate:dev

# Ver status das migrations
npm run migrate:status
```

### 4. Executar

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

A API estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

O projeto segue uma arquitetura em camadas (MVC):

```
src/
├── controllers/      # Recebem requisições HTTP
├── services/         # Lógica de negócio
├── repositories/     # Acesso ao banco de dados
├── routes/          # Definição de rotas
├── middlewares/     # Interceptadores (auth, CORS, etc.)
└── utils/           # Funções auxiliares
```

📖 **Documentação completa:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 📚 API - Endpoints

A API está organizada em 4 módulos principais:

### 1. Autenticação (`/api/v1/auth`)
- `POST /login` - Login com JWT
- `POST /forgot-password` - Solicitar código de recuperação de senha (6 dígitos)
- `POST /reset-password` - Redefinir senha com email e código
 - `GET /profile` - Perfil do usuário autenticado (exemplo de rota protegida)

### 2. Clientes (`/api/v1/clients`)
- `POST /individual` - Cadastro de pessoa física
- `POST /company` - Cadastro de pessoa jurídica
- `GET /:id` - Obter cliente por ID
- `PUT /individual/:id` - Atualizar PF
- `PUT /company/:id` - Atualizar PJ
- `PUT /password` - Alterar senha do cliente autenticado
- `DELETE /:id` - Remover cliente

### 3. Coletores (`/api/v1/collectors`)
- `POST /` - Cadastrar coletor com sede e pontos
- `GET /:id` - Obter coletor por ID

### 4. Descartes (`/api/v1/discards`)
- `POST /` - Registrar descarte
- `POST /eligible-points` - Buscar pontos elegíveis
- `GET /pending-pickup/:collectorId` - Descartes pendentes
- `POST /:discardId/offers` - Criar oferta de coleta
- `POST /offers/:offerId/accept` - Aceitar oferta
- `POST /offers/:offerId/reject` - Rejeitar oferta
- `POST /:discardId/cancel` - Cancelar descarte
- `POST /:discardId/complete` - Concluir descarte

📖 **Documentação completa dos endpoints:** [docs/API.md](docs/API.md)

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor em modo watch
npm run lint         # Verifica código com ESLint

# Banco de Dados
npm run migrate:dev  # Aplica migrations (dev)
npm run migrate:prod # Aplica migrations (prod)
 npm run migrate:status # Mostra status das migrations

# Produção
npm start            # Inicia servidor em modo produção
```

## 📖 Documentação

- **[API - Endpoints](docs/API.md)** - Documentação completa de todos os endpoints
- **[Arquitetura](docs/ARCHITECTURE.md)** - Estrutura do projeto e padrões arquiteturais
- **[Segurança](docs/SECURITY.md)** - Medidas de segurança implementadas
- **[Banco de Dados](docs/DATABASE.md)** - Schema Prisma e migrations
- **[Geocodificação](docs/GEOCODING.md)** - Sistema de geocodificação de endereços
 - **[Utilitários](docs/UTILS.md)** - Helpers e validadores
 - **[Ambiente e Variáveis](docs/ENVIRONMENT.md)** - Configuração de `.env`, CORS, JWT e email
 - **[Uploads](docs/UPLOADS.md)** - Regras, middleware e arquivos estáticos

Para detalhes de configuração e uploads, consulte os documentos específicos acima.

---

**RecicleAqui 2.0** - Facilitando a reciclagem e preservando o meio ambiente 🌱♻️
