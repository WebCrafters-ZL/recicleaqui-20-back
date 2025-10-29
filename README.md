# RecicleAqui 2.0 - Backend (Resumo)

Backend da aplicação RecicleAqui 2.0. Guia rápido com os passos mínimos para começar.

Pré-requisitos:
- Node.js 18+
- PostgreSQL (projeto usa Prisma)

Quick start & comandos
```bash
git clone https://github.com/seu-usuario/recicleaqui-20-back.git
cd recicleaqui-20-back
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
- `npx prisma generate` — gera client Prisma
- `npx prisma studio` — interface web para dados

Notas rápidas:
- Edite `.env` com as credenciais corretas (não commite `.env`).
- Revise as migrations no diretório `prisma/migrations` antes de aplicar em produção.

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


---

Exemplos de respostas
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
}
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

Resposta:

```json
{
	"status": 404,
	"message": "Cliente não encontrado"
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
