# RecicleAqui 2.0 - Backend

API REST para a aplicação RecicleAqui 2.0 - plataforma que conecta geradores de resíduos recicláveis com empresas de coleta e reciclagem.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API - Endpoints](#api---endpoints)
- [Segurança](#segurança)
- [Logs](#logs)

## 🎯 Sobre o Projeto

RecicleAqui 2.0 é uma plataforma que facilita o processo de reciclagem, conectando:
- **Clientes** (pessoas físicas ou jurídicas) que desejam descartar materiais recicláveis
- **Coletores** (empresas de reciclagem) que oferecem serviços de coleta domiciliar ou pontos de coleta

### Características Principais

- Autenticação JWT com diferentes níveis de acesso (CLIENT, COLLECTOR, ADMIN)
- Cadastro completo de clientes (PF e PJ) com validação de CPF/CNPJ
- Cadastro de coletores com sede e múltiplos pontos de coleta
- Busca de coletores por localização e materiais aceitos
- Sistema de logs estruturado com Winston
- Rate limiting e proteção contra abuso de requisições
- Validação robusta de dados de entrada

## 🚀 Tecnologias

- **[Node.js](https://nodejs.org/)** 18+ - Runtime JavaScript
- **[Express](https://expressjs.com/)** 5.1 - Framework web
- **[Prisma](https://www.prisma.io/)** 6.18 - ORM para banco de dados
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens
- **[Bcrypt](https://www.npmjs.com/package/bcryptjs)** - Hash de senhas
- **[Helmet](https://helmetjs.github.io/)** - Segurança de headers HTTP
- **[Winston](https://github.com/winstonjs/winston)** - Sistema de logs
- **[ESLint](https://eslint.org/)** - Linter e formatação de código

## 📦 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/recicleaqui-20-back.git
cd recicleaqui-20-back
```

2. Instale as dependências:
```bash
npm install
```

## ⚙️ Configuração

1. Crie o arquivo de ambiente a partir do exemplo:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/recicleaqui"
JWT_SECRET="seu-secret-jwt-super-seguro"
PORT=3000
NODE_ENV=production
```

Para desenvolvimento, crie também o `.env.development.local`:
```bash
cp .env.example .env.development.local
```

3. Execute as migrations do banco de dados:
```bash
# Desenvolvimento
npm run migrate:dev

# Produção
npm run migrate:prod
```

## ▶️ Executando o Projeto

### Modo Desenvolvimento
```bash
npm run dev
```
A API estará disponível em `http://localhost:3000`

### Modo Produção
```bash
npm start
```

### Outros Comandos
```bash
# Lint e formatação de código
npm run lint

# Aplicar migrations em desenvolvimento
npm run migrate:dev

# Aplicar migrations em produção
npm run migrate:prod
```

## 📁 Estrutura do Projeto

```
recicleaqui-20-back/
├── bin/
│   └── www                      # Script de inicialização do servidor
├── logs/                        # Arquivos de log gerados pelo Winston
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── migrations/             # Histórico de migrations
├── public/                     # Arquivos estáticos
├── src/
│   ├── app.js                  # Configuração principal do Express
│   ├── config/
│   │   └── DatabaseManager.js  # Gerenciador de conexão com o banco
│   ├── controllers/            # Controllers da API
│   │   ├── AuthController.js
│   │   ├── ClientController.js
│   │   └── CollectorController.js
│   ├── core/                   # Classes base
│   │   ├── BaseController.js
│   │   └── BaseService.js
│   ├── middlewares/            # Middlewares personalizados
│   │   ├── AuthMiddleware.js
│   │   ├── CorsMiddleware.js
│   │   ├── ErrorHandlerMiddleware.js
│   │   ├── NotFoundMiddleware.js
│   │   └── RateLimiterMiddleware.js
│   ├── repositories/           # Camada de acesso a dados
│   │   ├── AuthRepository.js
│   │   ├── ClientRepository.js
│   │   └── CollectorRepository.js
│   ├── routes/                 # Definição de rotas
│   │   ├── auth.js
│   │   ├── client.js
│   │   └── collector.js
│   ├── services/               # Lógica de negócio
│   │   ├── AuthService.js
│   │   ├── ClientService.js
│   │   └── CollectorService.js
│   └── utils/                  # Utilitários
│       ├── HashUtils.js
│       ├── Logger.js
│       └── Validators.js
├── .env.example                # Exemplo de variáveis de ambiente
├── eslint.config.js           # Configuração do ESLint
├── package.json
└── README.md
```

## 📚 API - Endpoints

A API está organizada em 3 módulos principais:

### Tipos de Usuário
- `CLIENT` — Pessoa física ou jurídica que gera resíduos recicláveis
- `COLLECTOR` — Empresa de reciclagem/coleta
- `ADMIN` — Administrador do sistema

### 1. Autenticação (`/api/v1/auth`)

Sistema de login com JWT que suporta todos os tipos de usuários.

#### POST `/api/v1/auth/login`
Autentica usuário e retorna token JWT.

**Payload:**

```json
{
  "email": "usuario@example.com",
  "password": "sua-senha"
}
```

**Resposta (200):**

```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "role": "CLIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Clientes (`/api/v1/clients`)

Gerenciamento de clientes (pessoas físicas e jurídicas).

**Tipos de Cliente:**
- `individual` — Pessoa física (CPF)
- `company` — Pessoa jurídica (CNPJ)

#### POST `/api/v1/clients/individual`
Cria um novo cliente pessoa física.

**Payload:**

```json
{
  "email": "joao@example.com",
  "password": "sua-senha",
  "phone": "11999990000",
  "firstName": "João",
  "lastName": "Silva",
  "cpf": "12345678909",
  "address": {
    "addressType": "Rua",
    "addressName": "A",
    "number": "100",
    "neighborhood": "Centro",
    "postalCode": "01001000",
    "city": "São Paulo",
    "state": "SP"
  }
}
```

**Resposta (201):**
```json
{
  "id": 12,
  "userId": 7,
  "type": "individual"
}
```

#### POST `/api/v1/clients/company`
Cria um novo cliente pessoa jurídica.

**Payload:**

```json
{
  "email": "contato@empresa.com",
  "password": "sua-senha",
  "phone": "1133334444",
  "companyName": "Empresa LTDA",
  "tradeName": "Empresa",
  "cnpj": "12345678000195",
  "address": {
    "addressType": "Rua",
    "addressName": "Comercial",
    "number": "200",
    "neighborhood": "Centro",
    "postalCode": "01001000",
    "city": "São Paulo",
    "state": "SP"
  }
}
```

**Resposta (201):**
```json
{
  "id": 15,
  "userId": 10,
  "type": "company"
}
```

#### GET `/api/v1/clients/:id`
Obtém dados completos de um cliente por ID.

#### PUT `/api/v1/clients/individual/:id`
Atualiza dados de um cliente pessoa física.

#### PUT `/api/v1/clients/company/:id`
Atualiza dados de um cliente pessoa jurídica.

#### DELETE `/api/v1/clients/:id`
Remove um cliente do sistema.

#### GET `/api/v1/clients`
Lista todos os clientes (uso administrativo).

**Observações:**
- Email, CPF e CNPJ são validados (incluindo dígitos verificadores)
- Senhas são armazenadas com hash bcrypt
- Erros retornam status HTTP apropriado: 400 (validação), 409 (conflito), 404 (não encontrado), 500 (erro interno)

### 3. Coletores (`/api/v1/collectors`)

Gerenciamento de empresas de coleta e reciclagem.

**Tipos de Coleta:**
- `HOME_PICKUP` — Coleta domiciliar
- `DROP_OFF_POINT` — Apenas pontos de coleta
- `BOTH` — Ambos os serviços

#### POST `/api/v1/collectors`
Cria um novo coletor com sede e pontos de coleta.

**Payload:**

```json
{
  "email": "contato@recicladora.com",
  "password": "senha-segura",
  "phone": "1133334444",
  "companyName": "Recicladora LTDA",
  "tradeName": "Recicladora",
  "cnpj": "12345678000195",
  "description": "Empresa especializada em reciclagem de plástico e papel",
  "operatingHours": "Seg-Sex: 8h-18h",
  "collectionType": "BOTH",
  "acceptedLines": ["VERDE", "AZUL", "MARROM"],
  "headquarters": {
    "addressType": "Rua",
    "addressName": "Industrial",
    "number": "500",
    "neighborhood": "Distrito Industrial",
    "postalCode": "13500000",
    "city": "Rio Claro",
    "state": "SP",
    "latitude": -22.4113,
    "longitude": -47.5614
  },
  "collectionPoints": [
    {
      "name": "Ponto Centro",
      "description": "Ponto de coleta no centro da cidade",
      "addressType": "Rua",
      "addressName": "Principal",
      "number": "100",
      "neighborhood": "Centro",
      "postalCode": "13500001",
      "city": "Rio Claro",
      "state": "SP",
      "latitude": -22.4000,
      "longitude": -47.5500,
      "operatingHours": "Seg-Sab: 7h-19h",
      "acceptedLines": ["VERDE", "AZUL"]
    }
  ]
}
```

**Resposta (201):**
```json
{
  "id": 5,
  "userId": 12,
  "email": "contato@recicladora.com",
  "role": "COLLECTOR",
  "collectionType": "BOTH"
}
```

#### GET `/api/v1/collectors/:id`
Obtém dados completos de um coletor por ID (inclui sede e pontos de coleta).

**Resposta (200):**

```json
{
  "id": 5,
  "companyName": "Recicladora LTDA",
  "tradeName": "Recicladora",
  "cnpj": "12345678000195",
  "phone": "1133334444",
  "description": "Empresa especializada em reciclagem de plástico e papel",
  "operatingHours": "Seg-Sex: 8h-18h",
  "collectionType": "BOTH",
  "acceptedLines": ["VERDE", "AZUL", "MARROM"],
  "headquarters": {
    "addressType": "Rua",
    "addressName": "Industrial",
    "number": "500",
    "neighborhood": "Distrito Industrial",
    "city": "Rio Claro",
    "state": "SP"
  },
  "collectionPoints": [
    {
      "id": 1,
      "name": "Ponto Centro",
      "city": "Rio Claro",
      "state": "SP",
      "isActive": true,
      "acceptedLines": ["VERDE", "AZUL"]
    }
  ]
}
```

### 4. Descartes (`/api/v1/discards`)

Fluxo para o cliente registrar descarte de resíduos em ponto de coleta ou solicitar coleta domiciliar.

#### Enum de Linhas de Materiais
As linhas aceitas são pré-definidas:
```
VERDE | MARROM | AZUL | BRANCA
```
Cada coletor cadastra um conjunto em `acceptedLines`. Cada ponto de coleta cadastra um subconjunto em `acceptedLines` próprio.

#### Modelos Principais

`Discard`:
```json
{
  "id": 1,
  "clientId": 10,
  "mode": "PICKUP", // ou COLLECTION_POINT
  "lines": ["VERDE", "AZUL"],
  "collectionPointId": null,
  "status": "PENDING", // PENDING | OFFERED | SCHEDULED | CANCELLED | COMPLETED
  "scheduledSlot": null,
  "createdAt": "2025-11-25T08:00:00Z"
}
```

`Offer` (proposta de coleta feita por coletor):
```json
{
  "id": 3,
  "discardId": 1,
  "collectorId": 5,
  "proposedSlots": [
    { "date": "2025-11-27", "start": "09:00", "end": "10:00" },
    { "date": "2025-11-27", "start": "14:00", "end": "15:00" }
  ],
  "acceptedSlot": null,
  "status": "PENDING"
}
```

#### Registrar Descarte
`POST /api/v1/discards`

Payload para ponto de coleta:
```json
{
  "clientId": 10,
  "mode": "COLLECTION_POINT",
  "lines": ["VERDE", "AZUL"],
  "collectionPointId": 22,
  "description": "Latas e jornais"
}
```

Payload para coleta domiciliar:
```json
{
  "clientId": 10,
  "mode": "PICKUP",
  "lines": ["VERDE", "MARROM"],
  "description": "Vidro limpo e resíduos orgânicos secos"
}
```

Resposta (201):
```json
{
  "id": 40,
  "status": "PENDING",
  "mode": "PICKUP",
  "lines": ["VERDE", "MARROM"]
}
```

#### Listar Pontos Elegíveis
`POST /api/v1/discards/eligible-points?lines=VERDE,AZUL`

Body contendo endereço do cliente (exemplo simplificado):
```json
{
  "address": {
    "city": "São Paulo",
    "state": "SP",
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}
```
Retorna lista ordenada por proximidade.

#### Listar Descartes Pendentes para Coletor (Pickup)
`GET /api/v1/discards/pending-pickup/:collectorId`
Retorna descartes `PENDING` cujo conjunto de linhas está contido em `acceptedLines` do coletor.

#### Criar Oferta
`POST /api/v1/discards/:discardId/offers`
```json
{
  "collectorId": 5,
  "proposedSlots": [
    { "date": "2025-11-28", "start": "08:00", "end": "09:00" },
    { "date": "2025-11-28", "start": "16:00", "end": "17:00" }
  ]
}
```
Status do descarte muda para `OFFERED`.

#### Aceitar Oferta
`POST /api/v1/discards/offers/:offerId/accept`
```json
{ "chosenSlotIndex": 1 }
```
Atualiza `Offer.status` para `ACCEPTED` e `Discard.status` para `SCHEDULED`.

#### Rejeitar Oferta
`POST /api/v1/discards/offers/:offerId/reject`
Retorna descarte para `PENDING`.

#### Cancelar Descarte
`POST /api/v1/discards/:discardId/cancel`
Altera status para `CANCELLED` (se não estiver COMPLETED).

#### Concluir Descarte
`POST /api/v1/discards/:discardId/complete`
Altera status para `COMPLETED`.

### Observações do Fluxo de Descarte
- Apenas descartes `PICKUP` recebem ofertas.
- Coletor só pode ofertar se aceitar todas as linhas do descarte.
- Rejeição de oferta retorna descarte ao status `PENDING` para outros coletores responderem.
- `scheduledSlot` é gravado após aceitação de oferta.

### Campos Legados
`acceptedMaterials` foi substituído por `acceptedLines`. Requisições antigas ainda funcionam se enviarem `acceptedMaterials` (fallback interno), mas recomenda-se migração.

### Exemplos de Respostas de Erro

#### 400 - Bad Request (CPF inválido)
```json
{
  "status": 400,
  "message": "CPF inválido"
}
```

#### 404 - Not Found
```json
{
  "status": 404,
  "message": "Cliente não encontrado"
}
```

#### 409 - Conflict (CNPJ já cadastrado)
```json
{
  "status": 409,
  "message": "CNPJ já cadastrado"
}
```

## 🔒 Segurança

A API implementa múltiplas camadas de segurança:

### Middlewares de Segurança

- **Helmet** - Configura headers HTTP seguros
- **CORS** - Controle de origens permitidas
- **Rate Limiting** - Proteção contra abuso de requisições (limite de 100 req/15min por IP)
- **Error Handler** - Tratamento centralizado de erros

### Autenticação e Autorização

- **JWT (JSON Web Tokens)** - Autenticação stateless
- **Bcrypt** - Hash de senhas com salt (10 rounds)
- **Middleware de Autenticação** - Proteção de rotas que requerem autenticação

### Validação de Dados

- **Validadores personalizados** para:
  - CPF (com verificação de dígitos)
  - CNPJ (com verificação de dígitos)
  - Email (formato válido)
  - Telefone
- **Sanitização** de dados de entrada
- **Validação de schemas** no nível de serviço

### Boas Práticas

- Soft delete para pontos de coleta (campo `isActive`)
- Logs estruturados com Winston
- Separação de ambientes (desenvolvimento/produção)
- Variáveis de ambiente para dados sensíveis
- ESLint com plugin de segurança

## 📊 Logs

O sistema utiliza **Winston** para logging estruturado:

- Logs são salvos no diretório `/logs`
- Rotação diária de arquivos
- Níveis: error, warn, info, http, debug
- Formato JSON para fácil parsing
- Logs HTTP com Morgan

Exemplo de configuração:
```javascript
// src/utils/Logger.js
winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});
```

## 🗄️ Banco de Dados

### Schema Prisma

O projeto utiliza Prisma ORM com PostgreSQL. Principais modelos:

- **User** - Usuários do sistema (base para todos os tipos)
- **Client** - Clientes (PF ou PJ)
  - **Individual** - Dados de pessoa física
  - **Company** - Dados de pessoa jurídica
  - **Address** - Endereço do cliente
- **Collector** - Empresas coletoras
  - **CollectorHeadquarters** - Sede da empresa
  - **CollectionPoint** - Pontos de coleta
  - **Discard / Offer** - Fluxo de descarte e propostas de horários

### Migrations

As migrations estão em `/prisma/migrations` (principais):
- `20250924132924_user` - Tabela de usuários
- `20250925133408_client` - Tabelas de clientes
- `20251010011449_adjust_sizes` - Ajustes de tamanho de campos
- `20251113042943_add_collector` - Tabelas de coletores
- `20251125043706_discard` - Fluxo de descarte, ofertas e enum de linhas

⚠️ **Importante:** Revise as migrations antes de aplicar em produção!

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com padrão MVC:

```
Requisição → Router → Controller → Service → Repository → Database
                ↓
            Middlewares (Auth, CORS, Rate Limit, etc.)
                ↓
            Error Handler
```

### Camadas

1. **Routes** - Definição de endpoints e rotas
2. **Controllers** - Recebem requisições, delegam para services, retornam respostas
3. **Services** - Lógica de negócio e validações
4. **Repositories** - Acesso ao banco de dados via Prisma
5. **Middlewares** - Interceptadores de requisição (auth, CORS, etc.)
6. **Utils** - Funções utilitárias (validadores, hash, logger)

### Classes Base

- **BaseController** - Classe base para controllers com métodos comuns
- **BaseService** - Classe base para services com métodos comuns

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é privado e proprietário.

---

**RecicleAqui 2.0** - Facilitando a reciclagem e preservando o meio ambiente 🌱♻️
