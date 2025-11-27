# API - Endpoints

A API está organizada em 4 módulos principais: Autenticação, Clientes, Coletores e Descartes.

## Tipos de Usuário

- `CLIENT` — Pessoa física ou jurídica que gera resíduos recicláveis
- `COLLECTOR` — Empresa de reciclagem/coleta
- `ADMIN` — Administrador do sistema

---

## 1. Autenticação (`/api/v1/auth`)

Sistema de login com JWT que suporta todos os tipos de usuários.

### POST `/api/v1/auth/login`
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

### POST `/api/v1/auth/forgot-password`
Inicia fluxo de recuperação de senha. Sempre responde mensagem genérica para não expor existência do email.

**Payload:**
```json
{ "email": "usuario@example.com" }
```

**Resposta (200):**
```json
{ "message": "Se o email existir, enviaremos instruções." }
```

### POST `/api/v1/auth/reset-password`
Define nova senha usando token enviado por email (válido por 1 hora).

**Payload:**
```json
{ 
  "token": "<resetToken>", 
  "password": "NovaSenha123" 
}
```

**Resposta (200):**
```json
{ "message": "Senha atualizada com sucesso." }
```

#### Fluxo de Recuperação de Senha

1. Usuário solicita `forgot-password` → sistema gera `resetToken` e salva `resetTokenGeneratedAt`
2. Email enviado com dois links (se configurados):
   - Web (universal/app link): `${FRONTEND_URL_WEB}/reset-password?token=<resetToken>`
   - Deep link: `${FRONTEND_URL_DEEP}reset-password?token=<resetToken>`
3. Front-end envia `reset-password` com token e nova senha
4. Serviço valida: token existe, não expirou (≤ 1h) e atualiza a senha (hash bcrypt) limpando campos de reset

#### Ambiente de Desenvolvimento (Ethereal)

Se `USE_ETHEREAL=true` ou SMTP ausente, é criada automaticamente uma conta de teste e o log mostra a URL de preview do email (Nodemailer Ethereal). Abra a URL para visualizar o email real. O email inclui webLink e deepLink quando configurados.

---

## 2. Clientes (`/api/v1/clients`)

Gerenciamento de clientes (pessoas físicas e jurídicas).

**Tipos de Cliente:**
- `individual` — Pessoa física (CPF)
- `company` — Pessoa jurídica (CNPJ)

### POST `/api/v1/clients/individual`
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

### POST `/api/v1/clients/company`
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

### GET `/api/v1/clients/:id`
Obtém dados completos de um cliente por ID.

### PUT `/api/v1/clients/individual/:id`
Atualiza dados de um cliente pessoa física.

### PUT `/api/v1/clients/company/:id`
Atualiza dados de um cliente pessoa jurídica.

### PUT `/api/v1/clients/password`
Altera a senha do usuário autenticado (cliente). Requer JWT.

**Payload:**

```json
{
  "currentPassword": "SenhaAtual123",
  "newPassword": "NovaSenha456"
}
```

**Respostas:**
- 200: `{ "message": "Senha alterada com sucesso", "userId": <id> }`
- 400: `Senha atual inválida` ou campos obrigatórios ausentes
- 401: Usuário não autenticado
- 404: Usuário não encontrado

### DELETE `/api/v1/clients/:id`
Remove um cliente do sistema.

### GET `/api/v1/clients`
Lista todos os clientes (uso administrativo).

**Observações:**
- Email, CPF e CNPJ são validados na criação (incluindo dígitos verificadores)
- Senhas são armazenadas com hash bcrypt
- Erros retornam status HTTP apropriado: 400 (validação), 409 (conflito), 404 (não encontrado), 500 (erro interno)

#### Campos Imutáveis no Update de Cliente

- `email`: não pode ser alterado via update de cliente
- `cpf`/`cnpj`: não podem ser alterados após criação
- `password`: alteração somente via endpoint dedicado `PUT /api/v1/clients/password`

---

## 3. Coletores (`/api/v1/collectors`)

Gerenciamento de empresas de coleta e reciclagem.

**Tipos de Coleta:**
- `HOME_PICKUP` — Coleta domiciliar
- `DROP_OFF_POINT` — Apenas pontos de coleta
- `BOTH` — Ambos os serviços

### POST `/api/v1/collectors`
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

### GET `/api/v1/collectors/:id`
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

---

## 4. Descartes (`/api/v1/discards`)

Fluxo para o cliente registrar descarte de resíduos em ponto de coleta ou solicitar coleta domiciliar.

### Enum de Linhas de Materiais

As linhas aceitas são pré-definidas:
```
VERDE | MARROM | AZUL | BRANCA
```

Cada coletor cadastra um conjunto em `acceptedLines`. Cada ponto de coleta cadastra um subconjunto em `acceptedLines` próprio.

### Modelos Principais

**Discard:**
```json
{
  "id": 1,
  "clientId": 10,
  "mode": "PICKUP",
  "lines": ["VERDE", "AZUL"],
  "collectionPointId": null,
  "status": "PENDING",
  "scheduledSlot": null,
  "createdAt": "2025-11-25T08:00:00Z"
}
```

**Status possíveis:** `PENDING | OFFERED | SCHEDULED | CANCELLED | COMPLETED`

**Offer (proposta de coleta feita por coletor):**
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

### POST `/api/v1/discards`
Registra um novo descarte.

**Payload para ponto de coleta:**
```json
{
  "clientId": 10,
  "mode": "COLLECTION_POINT",
  "lines": ["VERDE", "AZUL"],
  "collectionPointId": 22,
  "description": "Latas e jornais"
}
```

**Payload para coleta domiciliar:**
```json
{
  "clientId": 10,
  "mode": "PICKUP",
  "lines": ["VERDE", "MARROM"],
  "description": "Vidro limpo e resíduos orgânicos secos"
}
```

**Resposta (201):**
```json
{
  "id": 40,
  "status": "PENDING",
  "mode": "PICKUP",
  "lines": ["VERDE", "MARROM"]
}
```

### POST `/api/v1/discards/eligible-points`
Lista pontos de coleta elegíveis por proximidade e linhas aceitas.

**Query params:** `?lines=VERDE,AZUL`

**Body (endereço do cliente):**
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

### GET `/api/v1/discards/pending-pickup/:collectorId`
Lista descartes pendentes de coleta domiciliar para um coletor específico.

Retorna descartes `PENDING` cujo conjunto de linhas está contido em `acceptedLines` do coletor.

### POST `/api/v1/discards/:discardId/offers`
Cria uma oferta de coleta (coletor propõe horários ao cliente).

**Payload:**
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

### POST `/api/v1/discards/offers/:offerId/accept`
Aceita uma oferta (cliente escolhe um dos horários propostos).

**Payload:**
```json
{ 
  "chosenSlotIndex": 1 
}
```

Atualiza `Offer.status` para `ACCEPTED` e `Discard.status` para `SCHEDULED`.

### POST `/api/v1/discards/offers/:offerId/reject`
Rejeita uma oferta.

Retorna descarte para `PENDING`.

### POST `/api/v1/discards/:discardId/cancel`
Cancela um descarte.

Altera status para `CANCELLED` (se não estiver COMPLETED).

### POST `/api/v1/discards/:discardId/complete`
Marca um descarte como concluído.

Altera status para `COMPLETED`.

---

## Observações do Fluxo de Descarte

- Apenas descartes `PICKUP` recebem ofertas
- Coletor só pode ofertar se aceitar todas as linhas do descarte
- Rejeição de oferta retorna descarte ao status `PENDING` para outros coletores responderem
- `scheduledSlot` é gravado após aceitação de oferta

### Campos Legados

`acceptedMaterials` foi substituído por `acceptedLines`. Requisições antigas ainda funcionam se enviarem `acceptedMaterials` (fallback interno), mas recomenda-se migração.

---

## Exemplos de Respostas de Erro

### 400 - Bad Request (CPF inválido)
```json
{
  "status": 400,
  "message": "CPF inválido"
}
```

### 404 - Not Found
```json
{
  "status": 404,
  "message": "Cliente não encontrado"
}
```

### 409 - Conflict (CNPJ já cadastrado)
```json
{
  "status": 409,
  "message": "CNPJ já cadastrado"
}
```
