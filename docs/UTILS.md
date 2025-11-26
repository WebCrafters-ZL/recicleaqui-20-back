# Utilitários (/utils)

Este diretório contém módulos utilitários reutilizáveis usados em toda a aplicação.

## Estrutura

```
utils/
├── validators/              # Módulos de validação especializados
│   ├── EmailValidator.js    # Validação de emails
│   ├── DocumentValidator.js # Validação de CPF, CNPJ, CEP
│   ├── PhoneValidator.js    # Validação de telefones
│   └── MaterialValidator.js # Validação de linhas de material
├── ConfigUtils.js           # Gerenciamento de variáveis de ambiente
├── Constants.js             # Constantes da aplicação
├── FormatUtils.js           # Formatação de dados (CPF, CNPJ, telefone, etc.)
├── GeocodingUtils.js        # Geocodificação de endereços
├── HashUtils.js             # Hashing de senhas
├── HttpErrorUtils.js        # Criação de erros HTTP
├── JwtUtils.js              # Geração e validação de tokens JWT
├── Logger.js                # Logging com Winston
└── Validators.js            # Interface unificada para validadores
```

## Módulos

### ConfigUtils

Centraliza o acesso a variáveis de ambiente, evitando repetição de código.

```javascript
import ConfigUtils from './utils/ConfigUtils.js';

// Acesso direto a configurações comuns
const secret = ConfigUtils.JWT_SECRET;
const isDev = ConfigUtils.isDevelopment;

// Métodos genéricos
const port = ConfigUtils.getNumber('PORT', 3000);
const debug = ConfigUtils.getBoolean('DEBUG', false);
```

### Constants

Define constantes usadas em toda a aplicação.

```javascript
import { MATERIAL_LINES, USER_ROLES, REGEX } from './utils/Constants.js';

// Uso de constantes
if (MATERIAL_LINES.includes(line)) { ... }
if (user.role === USER_ROLES.CLIENT) { ... }
if (REGEX.EMAIL.test(email)) { ... }
```

### HttpErrorUtils

Facilita a criação de erros HTTP com status code apropriado.

```javascript
import HttpErrorUtils from './utils/HttpErrorUtils.js';

// Métodos específicos
throw HttpErrorUtils.notFound('Usuário não encontrado');
throw HttpErrorUtils.unauthorized('Token inválido');
throw HttpErrorUtils.conflict('Email já cadastrado');

// Método genérico
throw HttpErrorUtils.createError('Erro customizado', 422);
```

### JwtUtils

Centraliza operações com tokens JWT.

```javascript
import JwtUtils from './utils/JwtUtils.js';

// Gerar token de autenticação
const token = JwtUtils.generateAuthToken(user);

// Verificar token
const decoded = JwtUtils.verify(token);

// Extrair token do header
const token = JwtUtils.extractFromHeader(req.headers.authorization);

// Verificar se expirado
if (JwtUtils.isExpired(token)) { ... }
```

### Validators

Interface unificada para validações. Usa módulos especializados internamente.

```javascript
import Validators from './utils/Validators.js';

// Validações
Validators.isValidEmail('teste@email.com');
Validators.isValidCPF('123.456.789-00');
Validators.isValidCNPJ('12.345.678/0001-00');
Validators.isValidPhone('(11) 98765-4321');
Validators.isValidCEP('12345-678');
Validators.isValidMaterialLine('VERDE');
Validators.areValidMaterialLines(['VERDE', 'AZUL']);

// Limpeza
Validators.onlyDigits('123.456.789-00'); // '12345678900'
```

### Validators Especializados

Para validações mais complexas, use os módulos especializados diretamente:

```javascript
import EmailValidator from './utils/validators/EmailValidator.js';
import DocumentValidator from './utils/validators/DocumentValidator.js';
import PhoneValidator from './utils/validators/PhoneValidator.js';
import MaterialValidator from './utils/validators/MaterialValidator.js';

// EmailValidator
EmailValidator.isValid(email);
EmailValidator.normalize(email); // lowercase + trim

// DocumentValidator
DocumentValidator.isValidCPF(cpf);
DocumentValidator.isValidCNPJ(cnpj);
DocumentValidator.isValidCEP(cep);
DocumentValidator.onlyDigits(value);

// PhoneValidator
PhoneValidator.isValid(phone);
PhoneValidator.isMobile(phone);  // 11 dígitos
PhoneValidator.isLandline(phone); // 10 dígitos

// MaterialValidator
MaterialValidator.isValidLine(line);
MaterialValidator.areValidLines(lines);
MaterialValidator.normalize(line); // uppercase
MaterialValidator.normalizeArray(lines);
```

### FormatUtils

Formatação de dados para exibição.

```javascript
import FormatUtils from './utils/FormatUtils.js';

// Formatação de documentos
FormatUtils.formatCPF('12345678900');    // '123.456.789-00'
FormatUtils.formatCNPJ('12345678000100'); // '12.345.678/0001-00'
FormatUtils.formatPhone('11987654321');   // '(11) 98765-4321'
FormatUtils.formatCEP('12345678');        // '12345-678'

// Formatação de valores
FormatUtils.formatCurrency(1234.56);      // 'R$ 1.234,56'
FormatUtils.formatDate(new Date());       // 'DD/MM/YYYY'
FormatUtils.formatDateTime(new Date());   // 'DD/MM/YYYY HH:mm:ss'

// Formatação de texto
FormatUtils.capitalize('joão silva');     // 'João Silva'
FormatUtils.truncate('texto longo...', 10); // 'texto l...'
```

### GeocodingUtils

Geocodificação de endereços usando Nominatim (OpenStreetMap).

```javascript
import { geocodeAddress, enrichAddressWithCoordinates } from './utils/GeocodingUtils.js';

// Geocodificar endereço
const coords = await geocodeAddress({
  addressName: 'Av. Paulista',
  number: '1000',
  city: 'São Paulo',
  state: 'SP'
});
// { latitude: -23.561, longitude: -46.656 }

// Enriquecer objeto com coordenadas
const addressWithCoords = await enrichAddressWithCoordinates(address);
```

### HashUtils

Hashing de senhas com bcrypt.

```javascript
import { hashPassword, comparePassword } from './utils/HashUtils.js';

// Hash de senha
const hashed = await hashPassword('senha123');

// Comparação
const isValid = await comparePassword('senha123', hashed);
```

### Logger

Sistema de logging com Winston.

```javascript
import logger from './utils/Logger.js';

// Logs
logger.info('Informação', { userId: 123 });
logger.error('Erro', { error: err.message });
logger.warn('Aviso');
logger.debug('Debug');

// Logger customizado
import { Logger } from './utils/Logger.js';
const customLogger = Logger.create({ serviceName: 'custom', level: 'debug' });
```

## Boas Práticas

1. **Use os utilitários**: Evite duplicar código. Se precisa de validação, formatação ou configuração, use os utilitários.

2. **Constantes**: Adicione novas constantes em `Constants.js` ao invés de hard-coded values.

3. **Validações**: Use `Validators.js` para validações simples, ou os módulos especializados para operações avançadas.

4. **Erros HTTP**: Use `HttpErrorUtils` para criar erros com status code apropriado.

5. **Configurações**: Use `ConfigUtils` para acessar variáveis de ambiente.

## Compatibilidade

Todos os utilitários mantêm compatibilidade retroativa com exports nomeados:

```javascript
// Forma antiga (ainda funciona)
import { isValidEmail } from './utils/Validators.js';

// Forma nova (recomendada)
import Validators from './utils/Validators.js';
Validators.isValidEmail(email);
```
