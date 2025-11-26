# Arquitetura do Projeto

## 📁 Estrutura de Diretórios

```
recicleaqui-20-back/
├── bin/
│   └── www                      # Script de inicialização do servidor
├── docs/                        # Documentação do projeto
├── logs/                        # Arquivos de log gerados pelo Winston
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   ├── prisma.config.js        # Configuração do Prisma
│   └── migrations/             # Histórico de migrations
├── public/                     # Arquivos estáticos
│   ├── index.html
│   └── stylesheets/
├── src/
│   ├── app.js                  # Configuração principal do Express
│   ├── config/
│   │   └── DatabaseManager.js  # Gerenciador de conexão com o banco
│   ├── controllers/            # Controllers da API
│   │   ├── AuthController.js
│   │   ├── ClientController.js
│   │   ├── CollectorController.js
│   │   └── DiscardController.js
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
│   │   ├── CollectorRepository.js
│   │   └── DiscardRepository.js
│   ├── routes/                 # Definição de rotas
│   │   ├── auth.js
│   │   ├── client.js
│   │   ├── collector.js
│   │   └── discard.js
│   ├── services/               # Lógica de negócio
│   │   ├── AuthService.js
│   │   ├── ClientService.js
│   │   ├── CollectorService.js
│   │   ├── DiscardService.js
│   │   └── EmailService.js
│   └── utils/                  # Utilitários
│       ├── validators/         # Validadores especializados
│       │   ├── EmailValidator.js
│       │   ├── DocumentValidator.js
│       │   ├── PhoneValidator.js
│       │   └── MaterialValidator.js
│       ├── ConfigUtils.js
│       ├── Constants.js
│       ├── FormatUtils.js
│       ├── GeocodingUtils.js
│       ├── HashUtils.js
│       ├── HttpErrorUtils.js
│       ├── JwtUtils.js
│       ├── Logger.js
│       └── Validators.js
├── .env.example                # Exemplo de variáveis de ambiente
├── eslint.config.js           # Configuração do ESLint
├── package.json
└── README.md
```

---

## 🏗️ Arquitetura em Camadas

O projeto segue uma arquitetura em camadas com padrão MVC:

```
Requisição → Router → Controller → Service → Repository → Database
                ↓
            Middlewares (Auth, CORS, Rate Limit, etc.)
                ↓
            Error Handler
```

### Fluxo de Requisição

1. **Cliente HTTP** faz uma requisição para a API
2. **Middlewares** processam a requisição (CORS, autenticação, rate limiting)
3. **Router** direciona para o controller apropriado
4. **Controller** recebe a requisição e delega para o service
5. **Service** aplica lógica de negócio e validações
6. **Repository** acessa o banco de dados via Prisma
7. **Database** executa operações no PostgreSQL
8. **Resposta** retorna através das camadas até o cliente
9. **Error Handler** captura e formata erros em qualquer ponto

---

## 📦 Camadas do Sistema

### 1. Routes (Rotas)
**Responsabilidade:** Definir endpoints e vincular a controllers

- Cada módulo tem seu arquivo de rotas (`auth.js`, `client.js`, `collector.js`, `discard.js`)
- Aplicam middlewares específicos (ex: autenticação)
- Definem verbos HTTP (GET, POST, PUT, DELETE)

**Exemplo:**
```javascript
// src/routes/client.js
router.post('/individual', ClientController.createIndividual);
router.get('/:id', AuthMiddleware.authenticate, ClientController.getById);
```

### 2. Controllers
**Responsabilidade:** Receber requisições HTTP e retornar respostas

- Extraem dados da requisição (body, params, query)
- Delegam lógica de negócio para services
- Formatam e retornam respostas HTTP
- Estendem `BaseController` para métodos comuns

**Exemplo:**
```javascript
// src/controllers/ClientController.js
class ClientController extends BaseController {
  async createIndividual(req, res, next) {
    try {
      const result = await ClientService.createIndividual(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}
```

### 3. Services
**Responsabilidade:** Implementar lógica de negócio e orquestrar operações

- Validam dados de entrada
- Aplicam regras de negócio
- Orquestram chamadas a múltiplos repositories
- Tratam erros de negócio
- Estendem `BaseService` para métodos comuns

**Exemplo:**
```javascript
// src/services/ClientService.js
class ClientService extends BaseService {
  static async createIndividual(data) {
    // Validações
    this.validateCPF(data.cpf);
    
    // Geocodificação
    const coordinates = await GeocodingUtils.geocode(data.address);
    
    // Criação no banco
    return await ClientRepository.createIndividual({
      ...data,
      address: { ...data.address, ...coordinates }
    });
  }
}
```

### 4. Repositories
**Responsabilidade:** Acesso direto ao banco de dados

- Encapsulam operações com Prisma ORM
- Realizam queries e mutations
- Não contêm lógica de negócio
- Retornam dados brutos do banco

**Exemplo:**
```javascript
// src/repositories/ClientRepository.js
class ClientRepository {
  static async createIndividual(data) {
    return await prisma.client.create({
      data: {
        user: { create: { email, password, role: 'CLIENT' } },
        individual: { create: { firstName, lastName, cpf } },
        address: { create: addressData }
      }
    });
  }
}
```

### 5. Middlewares
**Responsabilidade:** Interceptar e processar requisições

- **AuthMiddleware:** Valida tokens JWT e autenticação
- **CorsMiddleware:** Configura CORS
- **ErrorHandlerMiddleware:** Trata erros globalmente
- **NotFoundMiddleware:** Retorna 404 para rotas inexistentes
- **RateLimiterMiddleware:** Limita requisições por IP

### 6. Utils (Utilitários)
**Responsabilidade:** Funções auxiliares reutilizáveis

📋 **Para documentação completa dos utilitários, consulte [UTILS.md](UTILS.md)**

Principais módulos:
- **ConfigUtils:** Gerenciamento centralizado de variáveis de ambiente
- **Constants:** Constantes da aplicação (linhas de material, roles, regex)
- **HttpErrorUtils:** Criação padronizada de erros HTTP
- **JwtUtils:** Geração e validação de tokens JWT
- **FormatUtils:** Formatação de CPF, CNPJ, telefone, moeda, data
- **GeocodingUtils:** Geocodificação de endereços via Nominatim
- **HashUtils:** Hash e comparação de senhas com bcrypt
- **Logger:** Sistema de logs com Winston
- **Validators:** Interface unificada para validações
- **validators/**: Validadores especializados (Email, Document, Phone, Material)

---

## 🎯 Classes Base

### BaseController

Fornece métodos comuns para controllers:
- Tratamento padronizado de erros
- Métodos auxiliares para respostas HTTP
- Validação básica de requisições

```javascript
class BaseController {
  static handleError(error, res) {
    // Tratamento padronizado de erros
  }
  
  static success(res, data, status = 200) {
    return res.status(status).json(data);
  }
}
```

### BaseService

Fornece métodos comuns para services:
- Validações reutilizáveis
- Tratamento de erros de negócio
- Helpers para operações comuns

```javascript
class BaseService {
  static validateRequired(fields) {
    // Valida campos obrigatórios
  }
  
  static throwError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    throw error;
  }
}
```

---

## 🔧 Componentes Especiais

### DatabaseManager

Gerencia a conexão com o banco de dados PostgreSQL via Prisma:
- Singleton para garantir única instância do Prisma Client
- Tratamento de conexão e desconexão
- Pool de conexões configurado

### EmailService

Sistema de envio de emails:
- Suporte a Ethereal (desenvolvimento) e SMTP real (produção)
- Templates de emails (recuperação de senha, notificações)
- Configuração via variáveis de ambiente

### GeocodingUtils

Geocodificação automática de endereços:
- Integração com API Nominatim (OpenStreetMap)
- Obtenção de coordenadas (latitude/longitude)
- Cache e tratamento de erros
- Documentação: [GEOCODING.md](./GEOCODING.md)

---

## 🔄 Padrões de Projeto Utilizados

### 1. Layered Architecture (Arquitetura em Camadas)
Separação clara de responsabilidades em camadas distintas.

### 2. Repository Pattern
Abstração do acesso a dados, facilitando testes e manutenção.

### 3. Dependency Injection
Services e repositories são injetados onde necessário.

### 4. Singleton Pattern
DatabaseManager e Logger usam singleton para instância única.

### 5. Middleware Pattern
Processamento de requisições em cadeia através de middlewares.

### 6. Error Handler Pattern
Tratamento centralizado de erros em middleware dedicado.

---

## 🚀 Inicialização da Aplicação

O servidor é inicializado através do script `bin/www`:

1. Carrega variáveis de ambiente
2. Importa configuração do Express (`src/app.js`)
3. Conecta ao banco de dados
4. Inicia servidor HTTP na porta configurada
5. Configura handlers de shutdown graceful

```javascript
// bin/www (simplificado)
const app = require('../src/app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
```

---

## 📝 Configuração do Express

O arquivo `src/app.js` configura o Express:

```javascript
const express = require('express');
const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(RateLimiterMiddleware.limit());

// Rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/collectors', collectorRoutes);
app.use('/api/v1/discards', discardRoutes);

// Error handlers
app.use(NotFoundMiddleware.handle);
app.use(ErrorHandlerMiddleware.handle);

module.exports = app;
```

---

## 🧪 Testabilidade

A arquitetura facilita testes através de:

- **Camadas desacopladas:** Cada camada pode ser testada isoladamente
- **Repository Pattern:** Facilita mock de dados
- **Dependency Injection:** Permite injeção de mocks
- **Services isolados:** Lógica de negócio testável sem HTTP

---

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                        Cliente HTTP                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                      Middlewares                         │
│  [CORS] [Auth] [Rate Limit] [Error Handler]            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                        Routers                           │
│    [Auth] [Client] [Collector] [Discard]               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                      Controllers                         │
│  [AuthController] [ClientController] etc.               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                       Services                           │
│   [AuthService] [ClientService] [EmailService] etc.     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     Repositories                         │
│  [AuthRepository] [ClientRepository] etc.               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Prisma ORM                            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL                             │
└─────────────────────────────────────────────────────────┘
```
