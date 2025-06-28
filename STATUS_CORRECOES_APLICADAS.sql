-- ===============================================
-- STATUS DAS CORREÇÕES APLICADAS - MANUS FISIO
-- Execute para verificar o progresso das correções
-- ===============================================

-- ============================================
-- 1. VERIFICAR RLS HABILITADO
-- ============================================

SELECT 
    'RLS notification_settings' as item,
    CASE 
        WHEN c.relrowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESABILITADO'
    END as status,
    'CRÍTICO' as prioridade
FROM pg_class c 
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname = 'notification_settings';

-- ============================================
-- 2. VERIFICAR POLÍTICAS DE SEGURANÇA
-- ============================================

SELECT 
    'Política: ' || policyname as item,
    '✅ ATIVA' as status,
    'SEGURANÇA' as categoria
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'notification_settings'
AND policyname = 'Users manage own settings'

UNION ALL

SELECT 
    'Política Users profile' as item,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ OTIMIZADA'
        ELSE '❌ PENDENTE'
    END as status,
    'PERFORMANCE' as categoria
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
AND policyname = 'Users can view their own profile';

-- ============================================
-- 3. VERIFICAR ÍNDICES CRIADOS/REMOVIDOS
-- ============================================

-- Índice crítico criado
SELECT 
    'Índice calendar_events' as item,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CRIADO'
        ELSE '❌ PENDENTE'
    END as status,
    'PERFORMANCE' as categoria
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname = 'idx_calendar_events_created_by'

UNION ALL

-- Índices desnecessários removidos
SELECT 
    'Limpeza índices antigos' as item,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ REMOVIDOS'
        ELSE '⚠️ ALGUNS AINDA EXISTEM (' || COUNT(*) || ')'
    END as status,
    'OTIMIZAÇÃO' as categoria
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN ('idx_comments_author_id', 'idx_users_is_active', 'idx_notebooks_search');

-- ============================================
-- 4. VERIFICAR FUNÇÕES CORRIGIDAS
-- ============================================

WITH function_status AS (
    SELECT 
        p.proname,
        pg_get_function_identity_arguments(p.oid) as args,
        CASE 
            WHEN p.proconfig IS NULL THEN 'VULNERÁVEL'
            WHEN '' = ANY(p.proconfig) THEN 'SEGURO'
            ELSE 'CONFIGURADO'
        END as security_status
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname IN ('log_activity', 'has_notebook_permission', 'has_project_permission', 'handle_new_user')
)
SELECT 
    'Funções únicas' as item,
    COUNT(CASE WHEN security_status = 'SEGURO' THEN 1 END) || '/' || COUNT(*) || ' seguras' as status,
    'SEGURANÇA' as categoria
FROM function_status

UNION ALL

-- Funções duplicadas (is_admin, is_mentor)
SELECT 
    'Funções duplicadas' as item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
              WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_mentor') 
              AND p.proconfig IS NOT NULL AND '' = ANY(p.proconfig)) >= 4 
        THEN '✅ CORRIGIDAS'
        ELSE '❌ PENDENTES (execute CORRECOES_FUNCOES_DUPLICADAS.sql)'
    END as status,
    'SEGURANÇA' as categoria;

-- ============================================
-- 5. SCORE GERAL DE CORREÇÕES
-- ============================================

WITH corrections_score AS (
    SELECT 
        -- RLS habilitado (30 pontos)
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'notification_settings' AND c.relrowsecurity
        ) THEN 30 ELSE 0 END +
        
        -- Política criada (20 pontos)
        CASE WHEN EXISTS(
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = 'notification_settings' AND policyname = 'Users manage own settings'
        ) THEN 20 ELSE 0 END +
        
        -- Índice crítico (25 pontos)
        (SELECT COUNT(*) * 25 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_calendar_events_created_by') +
        
        -- Funções únicas corrigidas (20 pontos)
        LEAST(20, (SELECT COUNT(*) * 5 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
                   WHERE n.nspname = 'public' AND p.proname IN ('log_activity', 'has_notebook_permission', 'has_project_permission', 'handle_new_user') 
                   AND p.proconfig IS NOT NULL AND '' = ANY(p.proconfig))) +
        
        -- Base (5 pontos por estar executando)
        5 as total_score
)
SELECT 
    '🎯 SCORE GERAL' as item,
    total_score || '/100 pontos' as status,
    CASE 
        WHEN total_score >= 90 THEN '🟢 EXCELENTE'
        WHEN total_score >= 70 THEN '🟡 BOM'
        WHEN total_score >= 50 THEN '🟠 REGULAR'
        ELSE '🔴 CRÍTICO'
    END as categoria
FROM corrections_score;

-- ============================================
-- 6. PRÓXIMOS PASSOS RECOMENDADOS
-- ============================================

WITH next_steps AS (
    SELECT 
        CASE 
            WHEN NOT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = 'public' AND c.relname = 'notification_settings' AND c.relrowsecurity)
            THEN '1. Execute: ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;'
            
            WHEN NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_settings' AND policyname = 'Users manage own settings')
            THEN '1. Execute: Script de política de notification_settings'
            
            WHEN NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_calendar_events_created_by')
            THEN '1. Execute: CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);'
            
            WHEN (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_mentor') AND (p.proconfig IS NULL OR NOT '' = ANY(p.proconfig))) > 0
            THEN '1. Execute: CORRECOES_FUNCOES_DUPLICADAS.sql'
            
            ELSE '1. ✅ Todas as correções principais aplicadas!'
        END as next_action
)
SELECT 
    '📋 PRÓXIMO PASSO' as item,
    next_action as status,
    'AÇÃO' as categoria
FROM next_steps;

-- ===============================================
-- INSTRUÇÕES:
-- ===============================================

/*
COMO INTERPRETAR OS RESULTADOS:

✅ = Correção aplicada com sucesso
❌ = Correção ainda pendente  
⚠️ = Atenção necessária
🟢 = Status excelente
🟡 = Status bom
🟠 = Status regular
🔴 = Status crítico

SCORE IDEAL: 90-100 pontos

SE SCORE < 90:
- Siga as recomendações de "PRÓXIMO PASSO"
- Execute os scripts pendentes
- Execute este script novamente para verificar progresso

APÓS SCORE 90+:
- Remover NEXT_PUBLIC_MOCK_AUTH=true do código
- Ativar "Leaked Password Protection" no painel Auth
- Sistema pronto para produção!
*/ 