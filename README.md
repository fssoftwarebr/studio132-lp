# Studio132 Landing Page

Landing page da Studio132 em PHP puro.

## Desenvolvimento local

```bash
cp .env.example .env
php -S localhost:8000
```

O formulário cria cards na lista do Trello configurada pelas variáveis:

- `TRELLO_API_KEY`
- `TRELLO_API_TOKEN`
- `TRELLO_LIST_ID`

O endpoint `submit.php` precisa ser servido por PHP com a extensão cURL habilitada.
