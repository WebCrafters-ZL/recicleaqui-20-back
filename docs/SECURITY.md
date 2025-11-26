# Segurança

Este documento descreve as medidas de segurança implementadas na API RecicleAqui 2.0.

---

## 🔒 Middlewares de Segurança

### 1. Helmet

Configura headers HTTP seguros automaticamente:

```javascript
const helmet = require('helmet');
app.use(helmet());
```

**Headers configurados:**
- `Content-Security-Policy` - Previne XSS
- `X-Content-Type-Options: nosniff` - Previne MIME sniffing
- `X-Frame-Options: DENY` - Previne clickjacking
- `X-XSS-Protection` - Proteção contra XSS legado
- `Strict-Transport-Security` - Força HTTPS

### 2. CORS (Cross-Origin Resource Sharing)

Controla quais origens podem acessar a API:

```javascript
// src/middlewares/CorsMiddleware.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

**Configuração recomendada:**
```env
# .env
ALLOWED_ORIGINS="https://seuapp.com,https://admin.seuapp.com"
```

### 3. Rate Limiting

Proteção contra abuso de requisições e ataques de força bruta:

```javascript
// src/middlewares/RateLimiterMiddleware.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Limites aplicados:**
- 100 requisições por IP a cada 15 minutos
- Headers retornados: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

### 4. Error Handler

Tratamento centralizado de erros que previne vazamento de informações sensíveis:

```javascript
// src/middlewares/ErrorHandlerMiddleware.js
class ErrorHandlerMiddleware {
  static handle(err, req, res, next) {
    const status = err.status || 500;
    const message = status === 500 && process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message;

    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method
    });

    res.status(status).json({ status, message });
  }
}
```

**Comportamento:**
- Em produção: Oculta detalhes de erros internos (500)
- Em desenvolvimento: Retorna stack trace completo
- Registra todos os erros no Winston

---

## 🔐 Autenticação e Autorização

### JWT (JSON Web Tokens)

Sistema de autenticação stateless baseado em tokens:

**Geração de Token:**
```javascript
// src/services/AuthService.js
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Validação de Token:**
```javascript
// src/middlewares/AuthMiddleware.js
class AuthMiddleware {
  static authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  }

  static authorize(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      next();
    };
  }
}
```

**Uso:**
```javascript
// Requer autenticação
router.get('/profile', AuthMiddleware.authenticate, getProfile);

// Requer autenticação e role específica
router.delete('/users/:id', 
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  deleteUser
);
```

### Níveis de Acesso

- `CLIENT` - Pessoa física ou jurídica (acesso limitado a próprios dados)
- `COLLECTOR` - Empresa de coleta (acesso a descartes e ofertas)
- `ADMIN` - Administrador do sistema (acesso total)

---

## 🔑 Hash de Senhas

📋 **Para documentação completa, consulte [UTILS.md](UTILS.md#hashutils)**

Utiliza **bcrypt** com salt para armazenamento seguro de senhas:

```javascript
// src/utils/HashUtils.js
const bcrypt = require('bcryptjs');

class HashUtils {
  static async hash(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}
```

**Características:**
- Salt rounds: 10 (equilíbrio entre segurança e performance)
- Salt único por senha
- Resistente a rainbow tables
- Custo computacional dificulta ataques de força bruta

**Processo de login:**
```javascript
// src/services/AuthService.js
const isValidPassword = await HashUtils.compare(
  providedPassword,
  user.password
);

if (!isValidPassword) {
  throw new Error('Credenciais inválidas');
}
```

---

## ✅ Validação de Dados

📋 **Para documentação completa dos validadores, consulte [UTILS.md](UTILS.md#validators)**

### Validadores Personalizados

```javascript
// src/utils/Validators.js
class Validators {
  static validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Validações de formato
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return false;
    }

    // Valida dígitos verificadores
    // ... algoritmo completo
    return true;
  }

  static validateCNPJ(cnpj) {
    // Validação similar ao CPF
    // ... algoritmo completo
  }

  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static validatePhone(phone) {
    // Remove caracteres não numéricos
    phone = phone.replace(/[^\d]/g, '');
    return phone.length >= 10 && phone.length <= 11;
  }
}
```

### Validação em Camadas

1. **Controller**: Validação básica de presença de campos
2. **Service**: Validação de formato e regras de negócio
3. **Repository**: Constraints do banco de dados

**Exemplo:**
```javascript
// src/services/ClientService.js
static async createIndividual(data) {
  // Valida campos obrigatórios
  if (!data.email || !data.password || !data.cpf) {
    throw new Error('Campos obrigatórios não fornecidos');
  }

  // Valida formato
  if (!Validators.validateEmail(data.email)) {
    throw new Error('Email inválido');
  }

  if (!Validators.validateCPF(data.cpf)) {
    throw new Error('CPF inválido');
  }

  // Verifica duplicação
  const existing = await ClientRepository.findByCPF(data.cpf);
  if (existing) {
    throw new Error('CPF já cadastrado');
  }

  // Continua com criação...
}
```

### Sanitização

Todos os dados de entrada são sanitizados para prevenir:
- SQL Injection (Prisma ORM já previne)
- XSS (Cross-Site Scripting)
- NoSQL Injection

```javascript
// Exemplo de sanitização
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};
```

---

## 🛡️ Proteção de Dados Sensíveis

### Variáveis de Ambiente

Todas as informações sensíveis devem estar em variáveis de ambiente:

```env
# .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/recicleaqui"
JWT_SECRET="seu-secret-jwt-super-seguro-com-pelo-menos-32-caracteres"
SMTP_USER="usuario-smtp"
SMTP_PASS="senha-smtp"
```

**⚠️ NUNCA:**
- Commitar arquivo `.env` no Git
- Expor secrets em logs
- Retornar senhas em APIs
- Armazenar senhas em texto plano

### Exclusão de Campos Sensíveis

```javascript
// src/repositories/ClientRepository.js
static async findById(id) {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          // password: false (excluído)
          // resetToken: false (excluído)
        }
      }
    }
  });
}
```

---

## 🔄 Recuperação de Senha Segura

### Fluxo Implementado

1. **Solicitação de Reset:**
   - Token gerado com `crypto.randomBytes(32)`
   - Token armazenado com timestamp
   - Email enviado com link temporário

2. **Validação do Token:**
   - Verifica existência do token
   - Valida expiração (1 hora)
   - Token usado uma única vez

3. **Reset de Senha:**
   - Nova senha com hash bcrypt
   - Token e timestamp limpos
   - Invalida todos os tokens JWT anteriores (opcional)

```javascript
// src/services/AuthService.js
static async forgotPassword(email) {
  const user = await AuthRepository.findByEmail(email);
  
  // Resposta genérica para não expor existência do email
  if (!user) {
    return { message: 'Se o email existir, enviaremos instruções.' };
  }

  // Gera token seguro
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenGeneratedAt = new Date();

  await AuthRepository.updateResetToken(user.id, resetToken, resetTokenGeneratedAt);
  
  // Envia email
  await EmailService.sendPasswordReset(user.email, resetToken);
  
  return { message: 'Se o email existir, enviaremos instruções.' };
}

static async resetPassword(token, newPassword) {
  const user = await AuthRepository.findByResetToken(token);
  
  if (!user) {
    throw new Error('Token inválido ou expirado');
  }

  // Valida expiração (1 hora)
  const hoursSinceGeneration = (Date.now() - user.resetTokenGeneratedAt) / (1000 * 60 * 60);
  if (hoursSinceGeneration > 1) {
    throw new Error('Token expirado');
  }

  // Hash da nova senha
  const hashedPassword = await HashUtils.hash(newPassword);

  // Atualiza senha e limpa token
  await AuthRepository.updatePassword(user.id, hashedPassword);
  await AuthRepository.clearResetToken(user.id);

  return { message: 'Senha atualizada com sucesso.' };
}
```

---

## 📊 Logs de Segurança

Sistema de logs com Winston para auditoria e monitoramento:

```javascript
// src/utils/Logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security.log' }),
  ]
});

// Exemplo de log de segurança
logger.warn({
  type: 'FAILED_LOGIN',
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
});
```

**Eventos registrados:**
- Tentativas de login (sucesso e falha)
- Acessos negados (401, 403)
- Erros de validação
- Rate limiting ativado
- Tokens inválidos ou expirados

---

## 🔍 Boas Práticas Implementadas

### 1. Princípio do Menor Privilégio
- Usuários têm apenas permissões necessárias
- Roles bem definidas (CLIENT, COLLECTOR, ADMIN)

### 2. Defense in Depth (Defesa em Profundidade)
- Múltiplas camadas de segurança
- Validação em todas as camadas
- Tratamento de erros robusto

### 3. Fail Securely
- Erros não expõem informações sensíveis
- Falhas de autenticação retornam mensagens genéricas
- Logs detalhados apenas no servidor

### 4. Don't Trust User Input
- Todos os inputs são validados
- Sanitização de dados
- Prepared statements via Prisma ORM

### 5. Keep Security Simple
- Uso de bibliotecas consolidadas
- Padrões da indústria (JWT, bcrypt)
- Código legível e auditável

### 6. Security by Design
- Segurança considerada desde o design
- Arquitetura que facilita segurança
- Testes de segurança

---

## ⚠️ Checklist de Segurança

- [x] Senhas com hash bcrypt (10 rounds)
- [x] JWT com expiração (7 dias)
- [x] Rate limiting (100 req/15min)
- [x] CORS configurado
- [x] Helmet habilitado
- [x] Validação de CPF/CNPJ
- [x] Error handler que não vaza info
- [x] Logs estruturados
- [x] Variáveis de ambiente
- [x] HTTPS obrigatório (via Helmet)
- [x] Proteção contra XSS
- [x] Proteção contra CSRF (stateless API)
- [x] SQL Injection prevention (Prisma ORM)
- [x] Soft delete para dados sensíveis
- [x] Recuperação de senha segura

---

## 🚨 Recomendações para Produção

1. **HTTPS Obrigatório**
   - Configure SSL/TLS no servidor
   - Redirecione HTTP → HTTPS
   - Use certificados válidos

2. **Secrets Fortes**
   ```bash
   # Gerar JWT_SECRET seguro
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Monitoramento**
   - Configure alertas para tentativas de login falhas
   - Monitore logs de segurança
   - Implemente auditoria de acesso

4. **Backups**
   - Backups regulares do banco de dados
   - Criptografia de backups
   - Teste de restauração

5. **Atualizações**
   - Mantenha dependências atualizadas
   - Monitore vulnerabilidades (npm audit)
   - Aplique patches de segurança

6. **Firewall e Network Security**
   - Restrinja acesso ao banco de dados
   - Use VPN ou IP whitelisting
   - Configure firewall do servidor

7. **Rate Limiting Avançado**
   - Considere limites diferentes por endpoint
   - Rate limiting por usuário autenticado
   - Integração com Redis para ambientes distribuídos
