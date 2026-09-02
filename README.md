# Studio132 Landing Page

Landing page da Studio132 em PHP puro, com formulário de contato integrado ao Trello.

## Requisitos

- PHP 8.2 ou superior
- Extensão PHP cURL habilitada
- Uma chave e um token da API do Trello
- O ID da lista do Trello que receberá os novos cards

Confira os módulos PHP instalados:

```bash
php -m | grep curl
```

## Instalação

Clone o repositório e entre na pasta do projeto:

```bash
git clone git@github.com:fssoftwarebr/studio132-lp.git
cd studio132-lp
```

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

Preencha o `.env` com os dados do Trello:

```dotenv
TRELLO_API_KEY=sua_chave
TRELLO_API_TOKEN=seu_token
TRELLO_LIST_ID=id_da_lista_Leads
```

O arquivo `.env` não deve ser versionado.

## Execução local

O PHP embutido não carrega `.env` automaticamente. Exporte as variáveis antes de iniciar o servidor:

```bash
set -a
source .env
set +a
php -S localhost:8000
```

Acesse `http://localhost:8000` no navegador.

O formulário envia os dados para `submit.php`, que valida a solicitação e cria um card na lista configurada do Trello. As credenciais nunca são enviadas ao navegador.

## Produção

Configure as variáveis `TRELLO_API_KEY`, `TRELLO_API_TOKEN` e `TRELLO_LIST_ID` no ambiente do servidor e aponte o document root para esta pasta. O servidor precisa permitir a execução de `index.php` e `submit.php` e ter a extensão cURL habilitada.

Exemplo com PHP embutido para uma máquina de teste:

```bash
TRELLO_API_KEY="sua_chave" \
TRELLO_API_TOKEN="seu_token" \
TRELLO_LIST_ID="id_da_lista_Leads" \
php -S 0.0.0.0:8000
```
