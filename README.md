# VM Intelligence

Dashboard web pessoal para finanças, freelance, estudos, metas e inteligência operacional.

## Arquitetura

```text
Google Sheets privado
        ↓
GitHub Actions + Workload Identity Federation
        ↓
scripts/sync_dashboard.py
        ↓
data/dashboard.json (somente indicadores sanitizados)
        ↓
Site VM Intelligence
```

A planilha permanece como fonte principal de dados e cálculos. O site público nunca lê linhas transacionais diretamente e não contém credenciais Google.

## Segurança

O arquivo público `data/dashboard.json` deve conter apenas métricas agregadas e informações aprovadas para exibição.

Nunca publicar:

- lançamentos individuais de receitas/despesas
- nomes privados de clientes
- e-mails
- tokens
- chaves de Service Account
- credenciais ou secrets
- conteúdo integral do Google Sheets

## Áreas do dashboard

- Visão geral
- Financeiro
- Freelance
- Produtividade
- Metas
- Inteligência / Central de Ação

## Sincronização

O workflow está em:

`.github/workflows/sync_dashboard.yml`

O script responsável por gerar a camada pública está em:

`scripts/sync_dashboard.py`

A autenticação usa Workload Identity Federation, sem chave JSON.

## Projetos separados

Este repositório é exclusivo do **VM Intelligence**.

O projeto 3D ZAMP WORLD deve permanecer em repositório separado e não faz parte desta arquitetura.
