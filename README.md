# Studio132 Landing Page

Landing page da Studio132 em HTML/CSS/JavaScript, publicada na Netlify, com formulário de contato integrado ao Trello por uma Netlify Function.

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
```

O arquivo `.env` não deve ser versionado. As credenciais nunca são enviadas ao navegador.

Execute os testes da Netlify Function com:

```bash
npm test
```

## Produção

Na Netlify, conecte o repositório e use estas configurações:

- **Build command:** vazio
- **Publish directory:** `.`
- **Functions directory:** `netlify/functions`

Em **Project configuration > Environment variables**, adicione `TRELLO_API_KEY`, `TRELLO_API_TOKEN` e `TRELLO_LIST_ID`. As credenciais ficam disponíveis somente no servidor e nunca são enviadas ao navegador.

Também é possível publicar diretamente com a Netlify CLI:

```bash
netlify login
netlify link
netlify deploy --prod
```

O formulário envia os dados para `/api/consultoria/submissions`. Essa rota é atendida por `netlify/functions/consultoria-submissions.mts`, que valida a solicitação e cria o card na lista configurada do Trello.
