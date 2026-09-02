# Studio132 Landing Page

Landing page da Studio132 em HTML/CSS/JavaScript, publicada no Cloudflare Pages, com formulário de contato integrado ao Trello por Pages Function.

## Requisitos

- Node.js 20 ou superior
- Conta Cloudflare com Pages habilitado
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

Inicie o Cloudflare Pages localmente:

```bash
npm run dev
```

Acesse `http://localhost:8788` no navegador.

Para testar a integração com o Trello, crie um arquivo `.dev.vars`:

```dotenv
TRELLO_API_KEY=sua_chave
TRELLO_API_TOKEN=seu_token
TRELLO_LIST_ID=id_da_lista_Leads
```

O arquivo `.dev.vars` não deve ser versionado. As credenciais nunca são enviadas ao navegador.

Execute os testes da Pages Function com:

```bash
npm test
```

## Produção

No Cloudflare Pages, conecte o repositório GitHub e use estas configurações:

- **Build command:** vazio
- **Build output directory:** `.`

Em **Settings > Variables and Secrets**, adicione `TRELLO_API_KEY`, `TRELLO_API_TOKEN` e `TRELLO_LIST_ID` como secrets, não como valores públicos.

Também é possível publicar diretamente com o Wrangler:

```bash
npx wrangler login
npx wrangler pages project create studio132-lp
npx wrangler pages deploy . --project-name=studio132-lp
```

O formulário envia os dados para `functions/api/consultoria-submissions.js`, que valida a solicitação e cria o card na lista configurada do Trello.

Para configurar os secrets via Wrangler:

```bash
npx wrangler pages secret put TRELLO_API_KEY --project-name=studio132-lp
npx wrangler pages secret put TRELLO_API_TOKEN --project-name=studio132-lp
npx wrangler pages secret put TRELLO_LIST_ID --project-name=studio132-lp
```
