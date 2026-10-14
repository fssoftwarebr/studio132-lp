# Studio132 Landing Page

Landing page da Studio132 em HTML/CSS/JavaScript, publicada na Netlify, com formulário de contato integrado ao TetoApp e ao Trello por funções de servidor Netlify/Cloudflare.

## Requisitos

- Node.js 20 ou superior
- Site configurado na Netlify
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

A hospedagem ativa é o Cloudflare Pages `studio132-lp`, na conta `Contato@studio132.arq.br`, em https://studio132.arq.br. Consulte [conta, bindings e procedimento de deploy](docs/integracao-leads.md). As instruções Netlify abaixo permanecem como alternativa de runtime.

Na Netlify, conecte o repositório e use estas configurações:

- **Build command:** vazio
- **Publish directory:** `.`
- **Functions directory:** `netlify/functions`

Em **Project configuration > Environment variables**, adicione `TRELLO_API_KEY`, `TRELLO_API_TOKEN`, `TRELLO_LIST_ID`, `TETOAPP_LEAD_URL` e `TETOAPP_LEAD_TOKEN`. As credenciais ficam disponíveis somente no servidor e nunca são enviadas ao navegador.

Também é possível publicar diretamente com a Netlify CLI:

```bash
netlify login
netlify link
netlify deploy --prod
```

O formulário envia os dados para `/api/consultoria/submissions`. Essa rota é atendida por `netlify/functions/consultoria-submissions.js`, que valida a solicitação, registra o lead no TetoApp e cria o card na lista configurada do Trello. No Cloudflare, `functions/api/consultoria/submissions.js` usa a mesma lógica de `lib/consultoria-submissions.js`.

Configure as cinco variáveis no ambiente de servidor da hospedagem. Na Netlify use o escopo Functions; no Cloudflare configure o token como secret. Nunca inclua o token em HTML, JavaScript público ou arquivos versionados. Veja [o contrato de entrega](docs/integracao-leads.md).
