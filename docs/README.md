# Documentação do RecicleAqui 2.0 - Backend

Bem-vindo à documentação completa do projeto RecicleAqui 2.0 Backend.

## 📚 Índice da Documentação

### Documentação Técnica

- **[API - Endpoints](API.md)** - Documentação completa de todos os endpoints da API
  - Autenticação e recuperação de senha
  - Cadastro e gerenciamento de clientes (PF e PJ)
  - Cadastro e gerenciamento de coletores
  - Sistema de descartes e ofertas de coleta

- **[Arquitetura](ARCHITECTURE.md)** - Estrutura do projeto e padrões arquiteturais
  - Estrutura de diretórios
  - Arquitetura em camadas (MVC)
  - Padrões de projeto utilizados
  - Classes base e componentes

- **[Banco de Dados](DATABASE.md)** - Schema Prisma e migrations
  - Modelos do banco de dados
  - Relacionamentos entre entidades
  - Histórico de migrations
  - Queries comuns e otimizações

- **[Segurança](SECURITY.md)** - Medidas de segurança implementadas
  - Middlewares de segurança
  - Autenticação JWT e autorização
  - Validação de dados
  - Boas práticas e checklist

- **[Utilitários](UTILS.md)** - Módulos utilitários e helpers
  - Validadores (Email, CPF, CNPJ, Telefone, Material)
  - Formatadores de dados
  - Gerenciamento de configurações
  - Utilitários de JWT, Hash e HTTP

### Funcionalidades Específicas

- **[Geocodificação](GEOCODING.md)** - Sistema de geocodificação de endereços
  - Integração com API Nominatim (OpenStreetMap)
  - Obtenção automática de coordenadas
  - Busca por proximidade

---

## 🚀 Links Rápidos

### Para Usuários da API
- [Endpoints de autenticação](API.md#1-autenticação-apiv1auth)
- [Endpoints de clientes](API.md#2-clientes-apiv1clients)
- [Endpoints de coletores](API.md#3-coletores-apiv1collectors)
- [Endpoints de descartes](API.md#4-descartes-apiv1discards)

### Para Administradores
- [Configuração de segurança](SECURITY.md)
- [Migrations do banco](DATABASE.md#migrations)
- [Monitoramento e logs](ARCHITECTURE.md#componentes-especiais)

---

## 🔍 Busca Rápida

**Precisa encontrar algo específico?**

- **JWT e autenticação:** [API](API.md#1-autenticação-apiv1auth) | [Segurança](SECURITY.md#autenticação-e-autorização) | [Utilitários](UTILS.md#jwtutils)
- **Validação de CPF/CNPJ:** [Segurança](SECURITY.md#validação-de-dados) | [Utilitários](UTILS.md#validators)
- **Formatação de dados:** [Utilitários](UTILS.md#formatutils)
- **Configurações:** [Utilitários](UTILS.md#configutils)
- **Geocodificação:** [GEOCODING.md](GEOCODING.md)
- **Estrutura de pastas:** [ARCHITECTURE.md](ARCHITECTURE.md#estrutura-de-diretórios)
- **Schema do banco:** [DATABASE.md](DATABASE.md#modelos-do-banco-de-dados)
- **Rate limiting:** [SECURITY.md](SECURITY.md#3-rate-limiting)
- **Recuperação de senha:** [API](API.md#fluxo-de-recuperação-de-senha) | [SECURITY.md](SECURITY.md#recuperação-de-senha-segura)

---

## 📝 Convenções da Documentação

Esta documentação segue as seguintes convenções:

- **Blocos de código** são destacados com syntax highlighting apropriado
- **Exemplos práticos** são fornecidos sempre que possível
- **Links internos** facilitam a navegação entre documentos relacionados
- **Emojis** são usados para facilitar identificação visual de seções
- **Notas importantes** são destacadas com ⚠️ ou 📌

---

## 🔄 Manutenção da Documentação

Esta documentação deve ser mantida atualizada:

- **Ao adicionar novos endpoints:** Atualizar [API.md](API.md)
- **Ao modificar arquitetura:** Atualizar [ARCHITECTURE.md](ARCHITECTURE.md)
- **Ao adicionar migrations:** Atualizar [DATABASE.md](DATABASE.md)
- **Ao implementar segurança:** Atualizar [SECURITY.md](SECURITY.md)
- **Ao criar utilitários:** Atualizar [UTILS.md](UTILS.md)

---

**RecicleAqui 2.0** - Documentação mantida pela equipe de desenvolvimento 📚
