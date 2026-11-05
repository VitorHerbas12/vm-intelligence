# Dashboard Data Layer

O site público lê somente o arquivo `dashboard.json`.

Esse arquivo contém exclusivamente métricas agregadas e informações operacionais permitidas para exibição no dashboard.

## Segurança

Não incluir neste diretório:

- linhas individuais de receitas ou despesas
- nomes de clientes privados
- e-mails
- tokens
- credenciais Google
- chaves de API
- conteúdo integral da planilha

A origem principal continua sendo o Google Sheets privado. O processo de sincronização deve publicar somente o resumo sanitizado.
