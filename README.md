# RecicleAqui 2.0 - Backend (Resumo)

Backend da aplicação RecicleAqui 2.0. Guia rápido com os passos mínimos para começar.

Pré-requisitos:
- Node.js 18+
- PostgreSQL (projeto usa Prisma)

Quick start & comandos

- Revise as migrations no diretório `prisma/migrations` antes de aplicar em produção.

----------------

A API está organizada em 3 módulos principais:

**1. Autenticação (`/api/v1/auth`)**
- Sistema de login com JWT
- Suporta todos os tipos de usuários (CLIENT, COLLECTOR, ADMIN)

**2. Clientes (`/api/v1/clients`)**
- Cadastro de pessoas físicas e jurídicas
- Gerenciamento de dados cadastrais e endereços
- Tipos: `individual` (CPF) e `company` (CNPJ)

**3. Coletores (`/api/v1/collectors`)**
- Cadastro de empresas de reciclagem
- Gerenciamento de sede e pontos de coleta
- Busca por localização e materiais aceitos
- Tipos de coleta: domiciliar, pontos de coleta ou ambos

**Tipos de usuário:**
- `CLIENT` — pessoa física ou jurídica que gera resíduos recicláveis
- `COLLECTOR` — empresa de reciclagem/coleta
- `ADMIN` — administrador do sistema

Rotas de autenticação
---------------------

Base: `/api/v1/auth`

- POST `/api/v1/auth/login` — autentica usuário e retorna token JWT
	- Exemplo payload:

```json
{
	"email": "usuario@example.com",
	"password": "sua-senha"
}
```

	- Resposta de sucesso (200):

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

Rotas de cliente (resumo)
-------------------------

Base: `/api/v1/clients`

- POST `/api/v1/clients/individual` — cria cliente pessoa física
	- Exemplo payload:

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

- POST `/api/v1/clients/company` — cria cliente pessoa jurídica
	- Exemplo payload:

```json
{
	"email": "contato@empresa.com",
	"password": "sua-senha",
	"phone": "1133334444",
	"companyName": "Empresa LTDA",
	"tradeName": "Empresa",
	"cnpj": "12345678000195",
	"address": { ... }
}
```

- GET `/api/v1/clients/:id` — obtém cliente por id
- PUT `/api/v1/clients/individual/:id` — atualiza pessoa física
- PUT `/api/v1/clients/company/:id` — atualiza pessoa jurídica
- DELETE `/api/v1/clients/:id` — remove cliente
- GET `/api/v1/clients` — lista todos (uso administrativo)

Observações:
- As rotas validam email, CPF e CNPJ (incluindo dígitos verificadores). Erros são retornados pelo middleware central com status apropriado (400/409/404/500).
- As senhas são armazenadas hasheadas (bcrypt) — use `password` no payload em texto simples ao criar.

Rotas de coletor
----------------

Base: `/api/v1/collectors`

- POST `/api/v1/collectors` — cria coletor (empresa de reciclagem)
	- Exemplo payload:

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
	"acceptedMaterials": ["plastico", "papel", "papelao", "metal"],
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
			"acceptedMaterials": ["plastico", "papel"]
		}
	]
}
```

- GET `/api/v1/collectors/:id` — obtém coletor por id (inclui sede e pontos de coleta)

---

---------------------

1) Criação de pessoa física — sucesso (201)

Resposta:

```json
{
	"id": 12,
	"userId": 7,
	"type": "individual"
}
```

2) Criação de pessoa jurídica — conflito de CNPJ (409)

Resposta:

```json
{
	"status": 409,
	"message": "CNPJ já cadastrado"
```

3) Requisição com dado inválido — CPF inválido (400)

Resposta:

```json
{
	"status": 400,
	"message": "CPF inválido"
}
```

4) Obter cliente não encontrado (404)
	"message": "Cliente não encontrado"
}
5) Criação de coletor — sucesso (201)

Resposta:

```json
{
	"id": 5,
	"userId": 12,
	"email": "contato@recicladora.com",
	"role": "COLLECTOR",
	"collectionType": "BOTH"
}
```

6) Login — sucesso (200)

Resposta:

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

Como rodar a API localmente
--------------------------

Pré-requisitos: Node.js 18+ e PostgreSQL; copie `.env.example` para `.env` e ajuste as credenciais.

Comandos úteis (existentes em `package.json`):

```bash
# instalar dependências
npm install

# criar .env a partir do modelo
cp .env.example .env
# (opcional) criar .env.development.local
cp .env.example .env.development.local

# aplicar migrações em desenvolvimento e gerar client Prisma
npm run migrate:dev

# rodar em modo desenvolvimento (nodemon)
npm run dev

# rodar em produção (executa bin/www)
npm start
```

Observação: os scripts `migrate:dev` e `migrate:prod` usam `dotenv` para carregar o arquivo de ambiente apropriado; garanta que as variáveis de conexão ao banco (`DATABASE_URL`) estejam corretas antes de executar as migrations.

Segurança e Middlewares
------------------------

A API implementa os seguintes recursos de segurança:

- **Helmet**: Headers HTTP seguros
- **CORS**: Configuração de origens permitidas
- **Rate Limiting**: Proteção contra abuso de requisições
- **Bcrypt**: Hash de senhas com salt
- **JWT**: Tokens de autenticação (implementado no serviço de autenticação)
- **Validação de dados**: CPF, CNPJ e email são validados antes do cadastro
- **Soft delete**: Pontos de coleta são desativados, não removidos permanentemente

Tecnologias
-----------

- **Node.js** 18+ com ES Modules
- **Express** — framework web
- **Prisma** — ORM para PostgreSQL
- **PostgreSQL** — banco de dados
- **Bcrypt** — hash de senhas
- **JWT** — autenticação (jsonwebtoken)
- **Morgan** — logging de requisições HTTP
- **Helmet** — segurança HTTP
- **Winston** — logging estruturado (logs/)
