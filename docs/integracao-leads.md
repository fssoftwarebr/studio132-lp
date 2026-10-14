# Leads Studio132: TetoApp e Trello

O formulário mantém `POST /api/consultoria/submissions`, as mensagens em português e a permanência na página. Os adaptadores Netlify e Cloudflare usam `lib/consultoria-submissions.js`.

## Configuração de servidor

As cinco variáveis são obrigatórias antes de publicar:

- `TETOAPP_LEAD_URL`: URL da origem de leads no TetoApp.
- `TETOAPP_LEAD_TOKEN`: segredo Bearer da origem, somente no servidor.
- `TRELLO_API_KEY`, `TRELLO_API_TOKEN`, `TRELLO_LIST_ID`: integração existente.

Na Netlify, configure o escopo Functions. Referência: https://docs.netlify.com/build/functions/environment-variables/

## Entrega e reenvio

1. Validar os campos e WhatsApp brasileiro com DDD (10 ou 11 dígitos).
2. Registrar no TetoApp com `Authorization: Bearer`, `Idempotency-Key` e JSON. O nome e WhatsApp são campos canônicos; os demais campos ficam em `dados` e na mensagem. Não se declara consentimento que o formulário não coletou.
3. Após resposta de sucesso, criar o card no Trello.
4. Mostrar sucesso somente após as duas entregas.

O navegador gera uma chave aleatória por conteúdo do formulário e a preserva em reenvios na mesma página. Após sucesso ou alteração dos dados, gera outra chave. Clientes antigos sem header recebem uma chave gerada no servidor e não têm deduplicação entre tentativas.

Se o TetoApp falhar, o Trello não é chamado. Se o Trello falhar, o lead já registrado permanece no TetoApp; o reenvio com a mesma chave recebe o lead existente e tenta o Trello novamente. Cada chamada tem timeout de 15 segundos. O segredo não é enviado em redirects nem registrado em logs. O User-Agent identifica Studio132 e usa uma assinatura compatível com navegador, necessária no teste inicial contra a proteção Cloudflare do TetoApp.

O Trello não oferece a mesma garantia de idempotência nesta integração: se criar o card e a resposta se perder, um reenvio pode criar outro card. Recarregar a página também perde a chave local. Não há fila de reconciliação ou promessa de atomicidade entre os dois serviços.

## Validação

`npm test` cobre os dois adaptadores, o mapeamento, falhas de configuração/rede/API, replay do TetoApp, validação de WhatsApp, entrega existente ao Trello e a chave do formulário.

## Hospedagem confirmada em 2026-10-13

O projeto Pages `studio132-lp` pertence à conta `Contato@studio132.arq.br` (`b8e202d351eb9cf884de740ffe09c877`), com domínios `studio132.arq.br` e `studio132-lp-897.pages.dev`. Não pertence à conta global do Wrangler. O token de administração fica no Keychain, service `cloudflare-api-token`, account igual ao ID da conta. Pages não aceita `account_id` em `wrangler.toml`. Antes do deploy, configure `CLOUDFLARE_ACCOUNT_ID` e confira `node_modules/.cache/wrangler/pages.json`: o cache de Pages tem precedência sobre essa variável. Neste checkout, o cache deve conter o account ID da Studio132 e `project_name: studio132-lp`. As credenciais das duas integrações ficam nos bindings de produção. O deploy usa somente `index.html`, `css/`, `js/`, `images/` e `data/` como assets; as Functions são compiladas do repositório, sem publicar código de servidor, docs ou dependências como assets.

O URL público da origem fica em `[env.production.vars]` no `wrangler.toml`. O Wrangler substitui as variáveis plaintext ao publicar com configuração local; cadastrar somente no painel/API não basta. Os secrets existentes são preservados.

O runtime do Pages aceita `redirect: follow` ou `manual`, mas rejeita `error` antes da chamada HTTP. A integração usa `manual` e recusa respostas 3xx, impedindo o encaminhamento do Bearer para outro destino.

## Evidência de publicação em 2026-10-13

- Código `a76d546` publicado como produção no Pages: https://56c06ad6.studio132-lp-897.pages.dev (ativo em https://studio132.arq.br).
- Formulário preenchido e enviado pelo navegador com dados sintéticos; exibiu confirmação e limpou os campos após sucesso dos dois destinos.
- Replay direto no TetoApp com a mesma chave e payload retornou HTTP 200, lead ID 2 e `duplicate: true`, confirmando a gravação anterior sem novo lead.
- 24 testes passaram; Functions compiladas pelo Wrangler e adaptador Netlify compilado.
- Publicação direta no Pages; a PR #2 foi integrada ao `main` em 2026-10-13, preservando a integração nos próximos deploys.

## Deploy automático

O workflow `Cloudflare Pages` testa e compila PRs; publica apenas a `main`, após validação. Usa os secrets GitHub `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN`, mantendo os secrets TetoApp/Trello na Cloudflare. `npm run build:pages` prepara somente os assets públicos em `.pages-dist/`, incluindo o favicon e `/version.json` com o commit. O workflow confirma a versão e os dois arquivos de favicon pelo domínio público depois do deploy.

Referência: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
