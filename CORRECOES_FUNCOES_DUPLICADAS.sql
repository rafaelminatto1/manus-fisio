-- ===============================================
-- CORREÇÃO DE FUNÇÕES DUPLICADAS - MANUS FISIO
-- Resolve: ERROR 42725 function name is not unique
-- ===============================================

-- PROBLEMA IDENTIFICADO:
-- Existem 2 funções is_admin e 2 funções is_mentor com assinaturas diferentes

-- ============================================
-- 1. CORRIGIR SEARCH_PATH DAS FUNÇÕES ÚNICAS
-- ============================================

-- Funções sem duplicatas - podem usar nome simples
ALTER FUNCTION public.log_activity() SET search_path = '';
ALTER FUNCTION public.has_notebook_permission(notebook_uuid uuid, permission_level text) SET search_path = '';
ALTER FUNCTION public.has_project_permission(project_uuid uuid, permission_level text) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- ============================================
-- 2. CORRIGIR SEARCH_PATH DAS FUNÇÕES DUPLICADAS
-- ============================================

-- is_admin: Corrigir AMBAS as versões especificando assinatura completa
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.is_admin(user_id uuid) SET search_path = '';

-- is_mentor: Corrigir AMBAS as versões especificando assinatura completa  
ALTER FUNCTION public.is_mentor() SET search_path = '';
ALTER FUNCTION public.is_mentor(user_id uuid) SET search_path = '';

-- ============================================
-- 3. VERIFICAÇÃO DE SUCESSO
-- ============================================

-- Verificar se todas as funções foram corrigidas
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE 
        WHEN p.proconfig IS NULL THEN '❌ SEM search_path'
        WHEN '' = ANY(p.proconfig) THEN '✅ search_path SEGURO'
        ELSE '⚠️  search_path CONFIGURADO: ' || array_to_string(p.proconfig, ', ')
    END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN ('is_admin', 'is_mentor', 'has_notebook_permission', 'has_project_permission', 'log_activity', 'handle_new_user')
ORDER BY p.proname, arguments;

-- ============================================
-- 4. LIMPEZA OPCIONAL - REMOVER FUNÇÕES DUPLICADAS
-- ============================================

-- Se quiser manter apenas uma versão de cada função:
-- CUIDADO: Execute apenas se souber qual versão manter!

/*
-- Para manter apenas is_admin(user_id uuid) e remover is_admin():
-- DROP FUNCTION public.is_admin(); -- Remove versão sem parâmetros

-- Para manter apenas is_mentor(user_id uuid) e remover is_mentor():
-- DROP FUNCTION public.is_mentor(); -- Remove versão sem parâmetros

-- Verificação final após limpeza:
-- SELECT COUNT(*) as total_functions FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_mentor');
*/

-- ===============================================
-- INSTRUÇÕES:
-- ===============================================

/*
COMO EXECUTAR:

1. Execute este script no Supabase SQL Editor
2. Verifique o resultado da consulta de verificação
3. Todas as funções devem mostrar "✅ search_path SEGURO"
4. Opcional: Execute a limpeza se quiser remover duplicatas

RESULTADO ESPERADO:
✅ 6 funções corrigidas
✅ Vulnerabilidade search_path resolvida  
✅ Sem mais erros de funções duplicadas

TEMPO: 2-3 minutos
*/ 