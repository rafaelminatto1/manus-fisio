-- =====================================================
-- 🔍 DIAGNÓSTICO COMPLETO DAS FUNÇÕES
-- =====================================================
-- Execute para identificar exatamente o que precisa ser corrigido
-- =====================================================

-- 1. VERIFICAR TODAS AS FUNÇÕES EXISTENTES
SELECT 
  p.proname as function_name,
  CASE 
    WHEN 'public, pg_temp' = ANY(p.proconfig) THEN 'SECURE ✅'
    ELSE 'INSECURE ⚠️'
  END as security_status,
  p.proconfig as current_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname IN (
  'log_activity', 
  'is_admin', 
  'is_mentor', 
  'has_notebook_permission', 
  'has_project_permission', 
  'update_updated_at_column'
)
ORDER BY p.proname;

-- 2. LISTAR TODAS AS FUNÇÕES DO SCHEMA PUBLIC
SELECT 
  proname as function_name,
  CASE 
    WHEN proconfig IS NULL THEN 'NO CONFIG ⚠️'
    WHEN 'public, pg_temp' = ANY(proconfig) THEN 'SECURE ✅'
    ELSE 'NEEDS FIX ⚠️'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND prokind = 'f'
ORDER BY proname;

-- 3. CONTAR FUNÇÕES SEGURAS VS INSEGURAS
SELECT 
  COUNT(*) FILTER (WHERE 'public, pg_temp' = ANY(proconfig)) as secure_functions,
  COUNT(*) FILTER (WHERE proconfig IS NULL OR NOT('public, pg_temp' = ANY(proconfig))) as insecure_functions,
  COUNT(*) as total_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND prokind = 'f';

-- =====================================================
-- 📋 RESULTADO DO DIAGNÓSTICO
-- =====================================================
-- Execute este script e me envie os resultados
-- Assim posso criar a correção exata necessária
-- ===================================================== 