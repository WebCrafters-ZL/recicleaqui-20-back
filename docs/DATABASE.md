# Banco de Dados

Documentação sobre o banco de dados PostgreSQL e schema Prisma do RecicleAqui 2.0.

---

## 🗄️ Tecnologias

- **PostgreSQL** 12+ - Banco de dados relacional
- **Prisma ORM** 6.18 - Object-Relational Mapping
- **Prisma Migrate** - Sistema de migrations

---

## 📊 Schema Prisma

O schema está localizado em `prisma/schema.prisma` e define todos os modelos do banco de dados.

### Configuração do Prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## 📋 Modelos do Banco de Dados

### User (Usuário Base)

Tabela base para todos os tipos de usuários do sistema.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Campos para recuperação de senha
  resetToken           String?
  resetTokenGeneratedAt DateTime?

  // Relações
  client    Client?
  collector Collector?

  @@map("users")
}

enum Role {
  CLIENT
  COLLECTOR
  ADMIN
}
```

**Campos principais:**
- `email` - Email único do usuário
- `password` - Senha com hash bcrypt
- `role` - Tipo de usuário (CLIENT, COLLECTOR, ADMIN)
- `resetToken` - Código de 6 dígitos numéricos para recuperação de senha
- `resetTokenGeneratedAt` - Timestamp de geração do código (validade: 1 hora)

---

### Client (Cliente)

Representa pessoas físicas ou jurídicas que geram resíduos.

```prisma
model Client {
  id     Int    @id @default(autoincrement())
  userId Int    @unique
  phone  String
  avatarUrl String?

  // Relações
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  individual Individual?
  company    Company?
  address    Address?
  discards   Discard[]

  @@map("clients")
}
```

---

### Individual (Pessoa Física)

```prisma
model Individual {
  id        Int    @id @default(autoincrement())
  clientId  Int    @unique
  firstName String
  lastName  String
  cpf       String @unique

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@map("individuals")
}
```

**Validações:**
- `cpf` - CPF único, validado com dígitos verificadores

---

### Company (Pessoa Jurídica)

```prisma
model Company {
  id          Int    @id @default(autoincrement())
  clientId    Int    @unique
  companyName String
  tradeName   String
  cnpj        String @unique

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@map("companies")
}
```

**Validações:**
- `cnpj` - CNPJ único, validado com dígitos verificadores

---

### Address (Endereço)

Endereços de clientes com geocodificação automática.

```prisma
model Address {
  id           Int      @id @default(autoincrement())
  clientId     Int      @unique
  addressType  String
  addressName  String
  number       String
  complement   String?
  neighborhood String
  postalCode   String
  city         String
  state        String
  latitude     Float?
  longitude    Float?

  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@map("addresses")
}
```

**Geocodificação:**
- `latitude` e `longitude` são obtidos automaticamente via API Nominatim
- Permite cálculo de distâncias e busca por proximidade
- Ver [GEOCODING.md](./GEOCODING.md) para detalhes

---

### Collector (Coletor)

Empresas de coleta e reciclagem.

```prisma
model Collector {
  id             Int            @id @default(autoincrement())
  userId         Int            @unique
  phone          String
  companyName    String
  tradeName      String
  cnpj           String         @unique
  description    String?
  operatingHours String?
  collectionType CollectionType @default(BOTH)
  acceptedLines  MaterialLine[]

  // Relações
  user             User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  headquarters     CollectorHeadquarters?
  collectionPoints CollectionPoint[]
  offers           Offer[]

  @@map("collectors")
}

enum CollectionType {
  HOME_PICKUP      // Coleta domiciliar
  DROP_OFF_POINT   // Apenas pontos de coleta
  BOTH             // Ambos os serviços
}
```

---

### CollectorHeadquarters (Sede do Coletor)

```prisma
model CollectorHeadquarters {
  id           Int     @id @default(autoincrement())
  collectorId  Int     @unique
  addressType  String
  addressName  String
  number       String
  complement   String?
  neighborhood String
  postalCode   String
  city         String
  state        String
  latitude     Float?
  longitude    Float?

  collector Collector @relation(fields: [collectorId], references: [id], onDelete: Cascade)

  @@map("collector_headquarters")
}
```

---

### CollectionPoint (Ponto de Coleta)

Locais onde clientes podem levar resíduos.

```prisma
model CollectionPoint {
  id             Int            @id @default(autoincrement())
  collectorId    Int
  name           String
  description    String?
  addressType    String
  addressName    String
  number         String
  complement     String?
  neighborhood   String
  postalCode     String
  city           String
  state          String
  latitude       Float?
  longitude      Float?
  operatingHours String?
  acceptedLines  MaterialLine[]
  isActive       Boolean        @default(true)

  collector Collector @relation(fields: [collectorId], references: [id], onDelete: Cascade)
  discards  Discard[]

  @@map("collection_points")
}
```

**Soft Delete:**
- `isActive` permite desativar pontos sem deletar do banco
- Pontos inativos não aparecem em buscas

---

### MaterialLine (Linhas de Materiais)

Enum que define os tipos de materiais aceitos:

```prisma
enum MaterialLine {
  VERDE   // Vidro
  MARROM  // Orgânico
  AZUL    // Papel/Papelão
  BRANCA  // Não reciclável
}
```

**Uso:**
- Coletores definem quais linhas aceitam
- Pontos de coleta podem aceitar subconjunto das linhas do coletor
- Clientes informam quais linhas desejam descartar

---

### Discard (Descarte)

Registros de descarte de resíduos pelos clientes.

```prisma
model Discard {
  id                Int              @id @default(autoincrement())
  clientId          Int
  mode              DiscardMode
  lines             MaterialLine[]
  collectionPointId Int?
  status            DiscardStatus    @default(PENDING)
  description       String?
  scheduledSlot     Json?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  client          Client           @relation(fields: [clientId], references: [id], onDelete: Cascade)
  collectionPoint CollectionPoint? @relation(fields: [collectionPointId], references: [id])
  offers          Offer[]

  @@map("discards")
}

enum DiscardMode {
  PICKUP            // Coleta domiciliar
  COLLECTION_POINT  // Ponto de coleta
}

enum DiscardStatus {
  PENDING    // Aguardando ofertas
  OFFERED    // Coletor fez oferta
  SCHEDULED  // Cliente aceitou oferta
  CANCELLED  // Cancelado
  COMPLETED  // Concluído
}
```

**Fluxo:**
1. Cliente cria descarte (`PENDING`)
2. Coletores fazem ofertas (`OFFERED`)
3. Cliente aceita oferta (`SCHEDULED`)
4. Coleta realizada (`COMPLETED`)

---

### Offer (Oferta de Coleta)

Propostas de horários feitas por coletores.

```prisma
model Offer {
  id            Int         @id @default(autoincrement())
  discardId     Int
  collectorId   Int
  proposedSlots Json        // Array de { date, start, end }
  acceptedSlot  Json?       // Slot escolhido pelo cliente
  status        OfferStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  discard   Discard   @relation(fields: [discardId], references: [id], onDelete: Cascade)
  collector Collector @relation(fields: [collectorId], references: [id], onDelete: Cascade)

  @@map("offers")
}

enum OfferStatus {
  PENDING   // Aguardando resposta do cliente
  ACCEPTED  // Cliente aceitou
  REJECTED  // Cliente rejeitou
}
```

**Estrutura dos slots:**
```json
{
  "proposedSlots": [
    { "date": "2025-11-27", "start": "09:00", "end": "10:00" },
    { "date": "2025-11-27", "start": "14:00", "end": "15:00" }
  ],
  "acceptedSlot": { "date": "2025-11-27", "start": "09:00", "end": "10:00" }
}
```

---

## 🔄 Migrations

As migrations estão em `/prisma/migrations` e são aplicadas automaticamente.

### Histórico de Migrations

1. **20250924132924_user** - Tabela de usuários base
   - Campos: id, email, password, role
   - Enum Role (CLIENT, COLLECTOR, ADMIN)

2. **20250925133408_client** - Tabelas de clientes
   - Client, Individual, Company, Address
   - Validações de CPF e CNPJ

3. **20251010011449_adjust_sizes** - Ajustes de tamanhos
   - Aumenta limites de campos VARCHAR
   - Otimiza índices

4. **20251113042943_add_collector** - Tabelas de coletores
   - Collector, CollectorHeadquarters, CollectionPoint
   - Enum CollectionType e MaterialLine

5. **20251124003919_add_avatar_url_to_client** - Avatar de cliente
   - Campo avatarUrl em Client

6. **20251125043706_discard** - Sistema de descartes
   - Discard, Offer
   - Enum DiscardMode, DiscardStatus, OfferStatus

### Comandos de Migration

```bash
# Desenvolvimento - Aplica migrations e regenera client
npm run migrate:dev

# Produção - Apenas aplica migrations
npm run migrate:prod

# Ver status das migrations
npm run migrate:status

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Reset do banco (cuidado!)
npx prisma migrate reset
```

---

## 🔍 Queries Comuns

### Buscar Cliente Completo

```javascript
const client = await prisma.client.findUnique({
  where: { id: clientId },
  include: {
    user: {
      select: {
        id: true,
        email: true,
        role: true,
        // Exclui password e resetToken
      }
    },
    individual: true,
    company: true,
    address: true,
  }
});
```

### Buscar Coletor com Pontos

```javascript
const collector = await prisma.collector.findUnique({
  where: { id: collectorId },
  include: {
    headquarters: true,
    collectionPoints: {
      where: { isActive: true },
      orderBy: { name: 'asc' }
    }
  }
});
```

### Buscar Pontos por Proximidade e Linhas

```javascript
// Após geocodificação do endereço do cliente
const points = await prisma.collectionPoint.findMany({
  where: {
    isActive: true,
    city: clientAddress.city,
    state: clientAddress.state,
    acceptedLines: {
      hasEvery: requestedLines  // Aceita todas as linhas solicitadas
    }
  },
  include: {
    collector: {
      select: {
        tradeName: true,
        phone: true
      }
    }
  }
});

// Ordena por distância usando fórmula haversine
points.sort((a, b) => {
  const distA = calculateDistance(
    clientAddress.latitude,
    clientAddress.longitude,
    a.latitude,
    a.longitude
  );
  const distB = calculateDistance(
    clientAddress.latitude,
    clientAddress.longitude,
    b.latitude,
    b.longitude
  );
  return distA - distB;
});
```

### Buscar Descartes Pendentes para Coletor

```javascript
const pendingDiscards = await prisma.discard.findMany({
  where: {
    mode: 'PICKUP',
    status: 'PENDING',
    // Verifica se todas as linhas do descarte estão nas aceitas pelo coletor
    lines: {
      hasEvery: collector.acceptedLines
    }
  },
  include: {
    client: {
      include: {
        address: true,
        individual: true,
        company: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

---

## 🔐 Segurança do Banco

### Constraints

- **UNIQUE**: email, cpf, cnpj
- **CASCADE DELETE**: Deleta registros relacionados automaticamente
- **NOT NULL**: Campos obrigatórios

### Índices

Prisma cria índices automaticamente para:
- Primary keys (`@id`)
- Foreign keys (`@relation`)
- Campos unique (`@unique`)

### Soft Delete

Pontos de coleta usam `isActive` ao invés de deletar:
```javascript
// Desativar ponto
await prisma.collectionPoint.update({
  where: { id },
  data: { isActive: false }
});

// Queries ignoram inativos
where: { isActive: true }
```

---

## 📈 Performance

### Connection Pooling

Prisma gerencia pool de conexões automaticamente:
```javascript
// prisma/prisma.config.js
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Pool size padrão: 10 conexões
}
```

### Otimizações

1. **Select apenas campos necessários**
   ```javascript
   select: { id: true, email: true }  // Não carrega todos
   ```

2. **Paginação**
   ```javascript
   take: 20,  // Limita resultados
   skip: 0    // Offset
   ```

3. **Eager loading**
   ```javascript
   include: { address: true }  // Carrega em uma query
   ```

---

## 🔧 Manutenção

### Backup

```bash
# Exportar banco
pg_dump -U usuario -d recicleaqui > backup.sql

# Importar banco
psql -U usuario -d recicleaqui < backup.sql
```

### Monitoramento

```bash
# Ver queries lentas (PostgreSQL)
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Limpeza

```javascript
// Limpar tokens de reset expirados (cron job)
await prisma.user.updateMany({
  where: {
    resetTokenGeneratedAt: {
      lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h atrás
    }
  },
  data: {
    resetToken: null,
    resetTokenGeneratedAt: null
  }
});
```

---

## 📚 Recursos

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
