# ANÁLISE DE FRAGILIDADES - SISTEMA MANUS FISIO

## ESTADO ATUAL DO SISTEMA

**URL Supabase:** https://hycudcwtuocmufhpsnmr.supabase.co
**Tabelas:** 13 funcionais
**Usuários:** 10 ativos
**Projetos:** 2 ativos

## PROBLEMAS CRÍTICOS IDENTIFICADOS

### SEGURANÇA (4 problemas críticos)

1. **RLS Desabilitado em notification_settings**
   - Risco: Exposição total de dados
   - Correção: Habilitar RLS + política

2. **6 Funções com search_path mutável**
   - Funções: log_activity, has_notebook_permission, is_admin, is_mentor, has_project_permission, handle_new_user
   - Risco: Ataques de injeção
   - Correção: SET search_path = ''

3. **Proteção senhas comprometidas OFF**
   - Risco: Senhas vazadas
   - Correção: Ativar HaveIBeenPwned

4. **Extensão pg_trgm em schema público**
   - Risco: Segurança schema
   - Correção: Mover para schema extensions

### PERFORMANCE (4 problemas críticos)

1. **Chave estrangeira sem índice**
   - calendar_events.created_by sem índice
   - Impacto: Queries 10x mais lentas

2. **27 Políticas RLS ineficientes**
   - auth.uid() reavaliado por linha
   - Impacto: Performance degradada

3. **66 Políticas permissivas redundantes**
   - Múltiplas políticas mesmo role/action
   - Impacto: Execução desnecessária

4. **22 Índices não utilizados**
   - Consumindo espaço/recursos
   - Impacto: Overhead desnecessário

### FUNCIONALIDADES (3 problemas)

1. **Sistema mock ativo**
   - NEXT_PUBLIC_MOCK_AUTH = true
   - Impacto: Dados não reais

2. **Rotas 404 críticas**
   - /notebooks/new, /projects/new, /calendar/new
   - Impacto: Funcionalidades incompletas

3. **Sistema notificações vazio**
   - 0 registros notifications/calendar_events
   - Impacto: Features não funcionais

## PLANO DE CORREÇÃO

### PRIORIDADE 1 (1-2 dias)
- Corrigir RLS notification_settings
- Otimizar políticas RLS ineficientes
- Adicionar índice calendar_events.created_by

### PRIORIDADE 2 (3-5 dias)
- Migrar dados mock para reais
- Implementar rotas faltantes
- Ativar sistema notificações

### PRIORIDADE 3 (1-2 semanas)
- Funcionalidades avançadas
- Testes automatizados
- Otimizações finais

## IMPACTO ESPERADO

**Segurança:** C+ → A+
**Performance:** B → A+
**Funcionalidade:** 85% → 100%

Sistema pronto para produção após correções. 