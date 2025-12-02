# Uploads

Regras e fluxo de upload de arquivos (avatars) e de arquivos estáticos.

## Regras de Upload

- Apenas imagens (`image/*`)
- Tamanho máximo: 5 MB
- Campo do formulário: `avatar`

Implementação:
- Middleware: `src/middlewares/UploadMiddleware.js`
- Storage: `multer.memoryStorage()` (processa com sharp antes de salvar)
- Validação de tipo via `file.mimetype.startsWith('image/')`

## Diretórios

- Base de uploads: `uploads/`
- Avatars: `uploads/avatars/`

O servidor garante a existência dos diretórios (criação recursiva quando necessário).

## Servir Arquivos Estáticos

- Rota estática: `/uploads`
- Cache: 7 dias (`Cache-Control: public, max-age=604800, immutable`)
- Configuração: `src/app.js` via `express.static`

## Exemplo de uso (cURL)

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/caminho/para/arquivo.jpg" \
  http://localhost:3000/api/v1/clients/avatar
```

Observação: O endpoint exato pode variar conforme as rotas implementadas no módulo de clientes. Verifique `src/routes/client.js` para detalhes.

## Boas Práticas

- Validar tamanho e tipo de arquivo no client antes do upload
- Utilizar nomes normalizados e evitar metadados sensíveis
- Processar imagens (redimensionar/otimizar) antes de persistir
