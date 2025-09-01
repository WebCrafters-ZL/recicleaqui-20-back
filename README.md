# RecicleAqui 2.0 - Backend

Este projeto é o backend da aplicação **RecicleAqui 2.0**.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão recomendada: 18+)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Banco de dados (ex: PostgreSQL, MongoDB) conforme especificação do projeto

## Instalação

Primeiro, faça um fork deste repositório no GitHub. Em seguida, clone o seu fork:

```bash
git clone https://github.com/seu-usuario/recicleaqui-20-back.git
cd recicleaqui-20-back
```

Instale as dependências:

```bash
npm install
# ou
yarn install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as variáveis de ambiente necessárias, por exemplo:

```env
DATABASE_URL=seu_banco_de_dados
PORT=3000
```

## Execução

Para rodar o servidor em modo desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Para rodar em produção:

```bash
npm start
# ou
yarn start
```

O servidor estará disponível em `http://localhost:3000` (ou porta definida no `.env`).

## Scripts úteis

- `npm run dev` — Executa o servidor com hot reload.
- `npm start` — Executa o servidor em modo produção.

## Contribuição

Sinta-se à vontade para abrir issues e pull requests!

---