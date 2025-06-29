# Arquitetura do Sistema

Este documento descreve a arquitetura geral do Sistema de Gestão para Clínica de Fisioterapia.

## Visão Geral

O sistema segue uma arquitetura moderna baseada em componentes, com um frontend desacoplado do backend.

- **Frontend**: Uma Single Page Application (SPA) construída com Next.js e React.
- **Backend**: Utiliza os serviços do Supabase, incluindo autenticação, banco de dados PostgreSQL e APIs automáticas.
- **Banco de Dados**: PostgreSQL gerenciado pelo Supabase.
- **Infraestrutura**: O deploy é feito na Vercel, otimizada para projetos Next.js.

## Fluxo de Dados

1.  O **usuário** interage com a interface no **Frontend (Next.js)**.
2.  As ações do usuário disparam chamadas de API para o **Backend (Supabase)**.
3.  O Supabase processa a requisição, interage com o **banco de dados PostgreSQL** e retorna os dados.
4.  O frontend atualiza a interface com os dados recebidos. 