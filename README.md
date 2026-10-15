# Studio132 Landing Page

Landing page da Studio132 em HTML/CSS/JavaScript, hospedada em produção no **Cloudflare Pages**, em https://studio132.arq.br, com formulário de contato integrado ao TetoApp e ao Trello por Pages Functions. **Vercel não é a hospedagem deste projeto.** O adaptador Netlify permanece para desenvolvimento local e compatibilidade legada.

O favicon usa o símbolo atual da marca sobre fundo amarelo: `favicon.ico` (16, 32, 48 e 64 px) e `images/favicon.png` (256 px), declarados no `index.html`.

## Requisitos

- Node.js 20 ou superior
- Projeto de produção configurado no Cloudflare Pages
- Netlify CLI para desenvolvimento local
- Uma chave e um token da API do Trello
- O ID da lista do Trello que receberá os novos cards

Confira a versão do Node.js instalada:

```bash
node --version
```

## Instalação

Clone o repositório e entre na pasta do projeto:

```bash
git clone git@github.com:fssoftwarebr/studio132-lp.git
cd studio132-lp
```

Instale as ferramentas de desenvolvimento:

```bash
npm install
```

## Desenvolvimento local

Inicie o ambiente local da Netlify:

```bash
npm run dev
```

Acesse `http://localhost:8889` no navegador.

Para testar a integração com o Trello, crie um arquivo `.env`:

```dotenv
TRELLO_API_KEY=sua_chave
TRELLO_API_TOKEN=seu_token
TRELLO_LIST_ID=id_da_lista_Leads
TETOAPP_LEAD_URL=https://tetoapp.com.br/api/ingest/lead-sources/<sourceKey>/leads
TETOAPP_LEAD_TOKEN=segredo_da_origem
```

O arquivo `.env` não deve ser versionado. As credenciais nunca são enviadas ao navegador.

Execute os testes da Netlify Function com:

```bash
npm test
```

## Produção

A produção está no Cloudflare Pages `studio132-lp`, na conta Studio132, em https://studio132.arq.br. O deploy é automático pelo workflow `.github/workflows/cloudflare-pages.yml` a cada push/merge na `main`; também aceita execução manual pelo GitHub Actions. PRs rodam testes e compilação, sem publicar.

O workflow usa Node.js 22 e `npm ci`, executa `npm test`, prepara os assets com `npm run build:pages` e publica com o Wrangler instalado pelo lockfile. Apenas `index.html`, `favicon.ico`, `css/`, `js/`, `images/`, `data/` e `version.json` são publicados como assets. As Pages Functions são compiladas a partir de `functions/`, com a lógica compartilhada de `lib/`.

Os secrets GitHub Actions `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN` autorizam a publicação. As credenciais de TetoApp/Trello permanecem nos secrets de produção da Cloudflare; o URL da origem fica no `wrangler.toml`. Não coloque credenciais no código público.

Após publicar, o workflow verifica o commit em `/version.json`, as declarações de favicon no HTML e o conteúdo dos arquivos ICO/PNG no domínio de produção. Consulte [o contrato da integração](docs/integracao-leads.md).

O adaptador Netlify é mantido como código legado, mas não atende o domínio de produção.

## Hospedagem e Analytics: referência para manutenção

- **Hospedagem de produção:** Cloudflare Pages, projeto `studio132-lp`, conta Studio132 (`b8e202d351eb9cf884de740ffe09c877`). Domínios confirmados pela API em 14/10/2026: `studio132.arq.br` e `studio132-lp-897.pages.dev`.
- **Deploy:** `.github/workflows/cloudflare-pages.yml`, com publicação da `main`. Consulte a seção Produção acima e `docs/integracao-leads.md` antes de mudar a infraestrutura. Não usar instruções de deploy da Vercel para este projeto.
- **Netlify:** `netlify.toml`, `netlify/functions/` e `npm run dev` são ferramentas locais/legadas; sua presença não indica a hospedagem atual.
- **Cloudflare Web Analytics:** a API de Web Analytics confirmou instalação automática (`auto_install: true`), e o HTML público de produção contém `https://static.cloudflareinsights.com/beacon.min.js` e `data-cf-beacon`, verificados em 14/10/2026. O beacon é inserido pela Cloudflare e não está no `index.html` versionado; não adicionar outro snippet sem verificar a configuração para evitar duplicidade. Essa verificação confirma a instrumentação publicada, mas não confirma números ou recebimento de eventos no painel.

## Hero, pacotes e acessibilidade

O hero usa `/images/projeto-02.webp`, do portfólio existente, com prioridade de carregamento e dimensões explícitas. O preço inicial deve acompanhar o Nível 01. Os ajustes visuais ficam em `css/landing-improvements.css`, carregado depois dos estilos existentes.

Cada link “Quero este pacote” mantém `href="#solicitar"` como fallback. Com JavaScript, `js/form.js` preenche `nivel_escolhido` usando o texto exato da opção, dispara `change` e leva o foco ao seletor no formulário. Os campos, preços e contrato de entrega TetoApp/Trello permanecem os mesmos.

O HTML inclui canonical, Open Graph e Twitter Card com URLs absolutas de produção. A imagem social `/images/studio132-social.jpg` tem 1200 × 630 px e deriva do mesmo projeto do hero. Ao trocar a imagem, atualize as dimensões e descrições nos metadados. Referência: https://ogp.me/.

Os controles possuem foco visível, inputs com fonte mínima de 16 px, nome com autocomplete e WhatsApp com teclado de telefone. O status de envio usa uma região de anúncio acessível. `prefers-reduced-motion` desativa rolagem e transições; o carrossel pula diretamente entre projetos para não depender de `transitionend` ao contornar o último slide. Referência: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion.

Validação: `npm test`, `npm run build:pages` e compilação das Pages Functions conforme o workflow. O teste de seleção executa os listeners reais dos três pacotes. A conferência visual local deve cobrir desktop/mobile, foco por teclado e o carrossel com movimento reduzido. A publicação e o resultado em compartilhadores/buscadores precisam ser verificados após deploy; os metadados locais não comprovam atualização dos caches externos.
