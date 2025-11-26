# Geocodificação de Endereços

## Visão Geral

O sistema agora geocodifica automaticamente todos os endereços usando a API Nominatim do OpenStreetMap para obter as coordenadas geográficas (latitude e longitude).

## Funcionalidade

### Quando a Geocodificação Ocorre

A geocodificação é executada automaticamente nas seguintes operações:

#### Clientes (Individual e Empresa)
- **Criação**: Ao criar um cliente com endereço
- **Atualização**: Ao atualizar o endereço de um cliente existente

#### Coletores
- **Criação**: Ao criar um coletor com sede (headquarters) e pontos de coleta
- **Atualização**: Ao atualizar a sede de um coletor
- **Pontos de Coleta**: Ao criar ou atualizar pontos de coleta

### Como Funciona

1. Quando um endereço é enviado em uma requisição, o sistema:
   - Formata o endereço em uma string de consulta
   - Faz uma requisição à API Nominatim
   - Obtém as coordenadas (latitude e longitude)
   - Armazena as coordenadas junto com os demais dados do endereço

2. Se a geocodificação falhar (endereço inválido, API indisponível, etc.):
   - O endereço é salvo sem coordenadas
   - Um aviso é registrado nos logs
   - A operação continua normalmente

3. Se o endereço já possui coordenadas na requisição:
   - As coordenadas fornecidas são usadas diretamente
   - Nenhuma chamada à API é feita

## API Nominatim

### Especificações
- **URL Base**: `https://nominatim.openstreetmap.org/search`
- **Formato**: JSON
- **Restrição**: Brasil (countrycodes=br)
- **User-Agent**: RecicleAqui/2.0

### Política de Uso
- Delay de 1 segundo entre requisições consecutivas
- Limite de 1 resultado por consulta
- Conforme políticas de uso do OpenStreetMap

## Estrutura do Código

### GeocodingUtils.js
Localizado em `/src/utils/GeocodingUtils.js`, contém:

#### Funções Principais

**`geocodeAddress(address)`**
- Geocodifica um endereço usando a API Nominatim
- Retorna `{ latitude, longitude }` ou `null`

**`enrichAddressWithCoordinates(address)`**
- Enriquece um objeto de endereço com coordenadas
- Retorna o endereço completo com latitude e longitude

### Integração nos Repositories

#### ClientRepository
- `createIndividual()`: Geocodifica endereço na criação
- `createCompany()`: Geocodifica endereço na criação
- `updateIndividual()`: Geocodifica endereço na atualização
- `updateCompany()`: Geocodifica endereço na atualização

#### CollectorRepository
- `create()`: Geocodifica headquarters e pontos de coleta
- `update()`: Geocodifica headquarters se atualizado
- `createCollectionPoint()`: Geocodifica novo ponto de coleta
- `updateCollectionPoint()`: Geocodifica ponto de coleta atualizado

## Modelo de Dados

### Campos Adicionais

As seguintes tabelas possuem campos de coordenadas:

#### Address (Clientes)
```prisma
latitude   Float?
longitude  Float?
```

#### CollectorHeadquarters (Sede de Coletores)
```prisma
latitude   Float?
longitude  Float?
```

#### CollectionPoint (Pontos de Coleta)
```prisma
latitude   Float?
longitude  Float?
```

## Exemplo de Uso

### Criar Cliente com Endereço

```json
POST /api/clients/individual
{
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "11987654321",
  "firstName": "João",
  "lastName": "Silva",
  "cpf": "12345678900",
  "address": {
    "addressType": "Rua",
    "addressName": "Avenida Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "postalCode": "01310-100",
    "city": "São Paulo",
    "state": "SP"
  }
}
```

**Resultado no Banco:**
```json
{
  "address": {
    "addressType": "Rua",
    "addressName": "Avenida Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "postalCode": "01310-100",
    "city": "São Paulo",
    "state": "SP",
    "latitude": -23.5613,
    "longitude": -46.6565
  }
}
```

### Criar Coletor com Sede e Pontos

```json
POST /api/collectors
{
  "email": "coletor@example.com",
  "password": "senha123",
  "phone": "11987654321",
  "companyName": "Coleta Sustentável Ltda",
  "tradeName": "EcoColeta",
  "cnpj": "12345678000190",
  "headquarters": {
    "addressType": "Rua",
    "addressName": "Rua da Consolação",
    "number": "500",
    "neighborhood": "Consolação",
    "postalCode": "01301-000",
    "city": "São Paulo",
    "state": "SP"
  },
  "collectionPoints": [{
    "name": "Ponto Centro",
    "addressType": "Rua",
    "addressName": "Rua Augusta",
    "number": "100",
    "neighborhood": "Centro",
    "postalCode": "01305-000",
    "city": "São Paulo",
    "state": "SP",
    "acceptedLines": ["VERDE", "AZUL"]
  }]
}
```

**Resultado no Banco:**
- Headquarters terá latitude/longitude da Rua da Consolação
- Ponto de coleta terá latitude/longitude da Rua Augusta

## Logs

O sistema registra as seguintes informações:

- ✅ **Info**: Endereço sendo geocodificado
- ✅ **Info**: Coordenadas encontradas com sucesso
- ⚠️ **Warn**: Nenhuma coordenada encontrada para o endereço
- ⚠️ **Warn**: Endereço salvo sem coordenadas
- ❌ **Error**: Erro na API Nominatim
- ❌ **Error**: Erro ao geocodificar endereço

## Considerações

1. **Performance**: A geocodificação adiciona ~1 segundo por endereço devido à política de rate limiting do Nominatim
2. **Failover**: O sistema continua funcionando mesmo se a geocodificação falhar
3. **Coordenadas Manuais**: É possível enviar latitude/longitude manualmente para evitar a chamada à API
4. **Privacidade**: A API Nominatim é pública e não requer autenticação

## Melhorias Futuras

- Cache de endereços já geocodificados
- Geocodificação em background para melhor performance
- Suporte a outras APIs de geocodificação (Google Maps, etc.)
- Validação de qualidade das coordenadas retornadas
