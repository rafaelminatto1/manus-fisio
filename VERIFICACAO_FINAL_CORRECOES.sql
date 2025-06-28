-- ===============================================
-- VERIFICAÇÃO FINAL DAS CORREÇÕES - MANUS FISIO
-- Execute após aplicar todas as correções
-- ===============================================

-- ============================================
-- 1. VERIFICAR CORREÇÕES DE SEGURANÇA
-- ============================================

-- 1.1 Verificar RLS habilitado em notification_settings
SELECT 
    'notification_settings' as tabela,
    CASE 
        WHEN c.relrowsecurity THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESABILITADO'
    END as status_rls
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname = 'notification_settings';

-- 1.2 Verificar políticas de segurança criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    '✅ POLÍTICA ATIVA' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'notification_settings';

-- 1.3 Verificar search_path das funções corrigido
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE 
        WHEN p.proconfig IS NULL THEN '❌ VULNERÁVEL'
        WHEN '' = ANY(p.proconfig) THEN '✅ SEGURO'
        ELSE '⚠️ CONFIGURADO'
    END as status_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN ('is_admin', 'is_mentor', 'log_activity', 'handle_new_user', 'has_notebook_permission', 'has_project_permission')
ORDER BY p.proname, arguments;

-- ============================================
-- 2. VERIFICAR OTIMIZAÇÕES DE PERFORMANCE
-- ============================================

-- 2.1 Verificar índices críticos criados
SELECT 
    indexname,
    tablename,
    '✅ CRIADO' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname = 'idx_calendar_events_created_by';

-- 2.2 Verificar se índices desnecessários foram removidos
SELECT 
    indexname,
    tablename,
    '⚠️ ÍNDICE AINDA EXISTE (deveria ser removido)' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN ('idx_comments_author_id', 'idx_users_is_active', 'idx_notebooks_search');

-- 2.3 Contar total de políticas RLS otimizadas
SELECT 
    COUNT(*) as total_policies,
    COUNT(CASE WHEN policyname LIKE '%optimized%' OR policyname LIKE '%view their own%' THEN 1 END) as optimized_policies,
    '✅ POLÍTICAS RLS' as status
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 3. VERIFICAR TABELAS E ESTRUTURAS
-- ============================================

-- 3.1 Verificar todas as tabelas com RLS habilitado
SELECT 
    COUNT(*) as total_tables_with_rls,
    '✅ TABELAS PROTEGIDAS' as status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' 
AND c.relrowsecurity = true;

-- 3.2 Verificar extensões seguras
SELECT 
    extname as extension_name,
    nspname as schema_name,
    CASE 
        WHEN nspname = 'public' THEN '⚠️ EM SCHEMA PÚBLICO'
        ELSE '✅ EM SCHEMA SEGURO'
    END as security_status
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname IN ('pg_trgm', 'pgcrypto', 'uuid-ossp')
ORDER BY extname;

-- ============================================
-- 4. RESUMO GERAL DAS CORREÇÕES
-- ============================================

-- 4.1 Resumo de segurança
WITH security_check AS (
    SELECT 
        -- RLS em notification_settings
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'notification_settings' AND c.relrowsecurity
        ) THEN 1 ELSE 0 END as rls_fixed,
        
        -- Funções com search_path seguro
        (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
         WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_mentor', 'log_activity', 'handle_new_user', 'has_notebook_permission', 'has_project_permission')
         AND p.proconfig IS NOT NULL AND '' = ANY(p.proconfig)) as functions_fixed,
        
        -- Índices críticos criados
        (SELECT COUNT(*) FROM pg_indexes 
         WHERE schemaname = 'public' AND indexname = 'idx_calendar_events_created_by') as critical_indexes
)
SELECT 
    '🔒 SEGURANÇA' as categoria,
    CASE 
        WHEN rls_fixed = 1 THEN '✅ RLS CORRIGIDO'
        ELSE '❌ RLS PENDENTE'
    END as rls_status,
    functions_fixed || ' de 6 funções corrigidas' as functions_status,
    CASE 
        WHEN critical_indexes > 0 THEN '✅ ÍNDICES CRÍTICOS OK'
        ELSE '❌ ÍNDICES PENDENTES'
    END as performance_status
FROM security_check;

-- 4.2 Score final de segurança
WITH score AS (
    SELECT 
        CASE WHEN EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relname = 'notification_settings' AND c.relrowsecurity) THEN 40 ELSE 0 END +
        (SELECT COUNT(*) * 8 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_mentor', 'log_activity', 'handle_new_user', 'has_notebook_permission', 'has_project_permission') AND p.proconfig IS NOT NULL AND '' = ANY(p.proconfig)) +
        (SELECT COUNT(*) * 12 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_calendar_events_created_by') as total
)
SELECT 
    '🎯 SCORE FINAL' as resultado,
    total || '/100' as pontos,
    CASE 
        WHEN total >= 90 THEN '🟢 PRONTO PARA PRODUÇÃO'
        WHEN total >= 70 THEN '🟡 QUASE LÁ'
        ELSE '🔴 CORREÇÕES PENDENTES'
    END as status
FROM score;

-- ===============================================
-- INSTRUÇÕES DE USO:
-- ===============================================

/*
COMO USAR ESTE SCRIPT:

1. Execute após aplicar TODAS as correções
2. Verifique cada seção do resultado
3. Score ideal: 90-100 pontos
4. Status ideal: 🟢 EXCELENTE

SE SCORE < 90:
- Revisar correções não aplicadas
- Executar scripts pendentes
- Verificar permissões no Supabase Dashboard

INTERPRETAR RESULTADOS:
✅ = Correção aplicada com sucesso
❌ = Correção pendente/falhou
⚠️ = Atenção necessária

PRÓXIMO PASSO APÓS SCORE 90+:
- Remover NEXT_PUBLIC_MOCK_AUTH=true
- Testar sistema com dados reais
- Deploy para produção
*/ 