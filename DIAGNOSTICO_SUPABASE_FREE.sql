-- =====================================================
-- DIAGNÓSTICO SUPABASE FREE - POLÍTICAS RLS
-- =====================================================

-- 🔍 VERIFICAR POLÍTICAS EXISTENTES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 🔍 VERIFICAR ESPECÍFICAMENTE POLÍTICAS COM auth.uid()
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%auth.uid()%' 
  OR with_check LIKE '%auth.uid()%'
  OR qual LIKE '%(SELECT auth.uid())%'
  OR with_check LIKE '%(SELECT auth.uid())%'
)
ORDER BY tablename;

-- 🔍 VERIFICAR TABELAS QUE PRECISAM DE OTIMIZAÇÃO
SELECT 
  tablename,
  COUNT(*) as total_policies,
  COUNT(CASE WHEN qual LIKE '%auth.uid()%' THEN 1 END) as direct_auth_uid,
  COUNT(CASE WHEN qual LIKE '%(SELECT auth.uid())%' THEN 1 END) as optimized_auth_uid
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('notifications', 'projects', 'notebooks', 'calendar_events')
GROUP BY tablename;

-- 🔍 VERIFICAR PERMISSÕES ATUAIS DO USUÁRIO
SELECT 
  rolname,
  rolsuper,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin
FROM pg_roles 
WHERE rolname = current_user;

-- 🔍 VERIFICAR SE CONSEGUE CRIAR/ALTERAR POLÍTICAS (TESTE)
-- (Este comando não será executado, apenas mostra se há permissão)
-- DROP POLICY IF EXISTS "test_policy" ON public.notifications;

-- ✅ VERIFICAÇÃO SIMPLIFICADA PARA DEBUG
SELECT 
  'Políticas com view' as categoria,
  COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE '%view%';

-- ✅ VERIFICAÇÃO DE OTIMIZAÇÃO ESPECÍFICA
SELECT 
  'Políticas otimizadas' as categoria,
  COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND (qual LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%(SELECT auth.uid())%'); 