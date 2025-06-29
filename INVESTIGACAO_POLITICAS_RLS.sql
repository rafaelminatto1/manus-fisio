-- =====================================================
-- INVESTIGAÇÃO DETALHADA POLÍTICAS RLS
-- =====================================================

-- 🔍 1. LISTAR TODAS AS POLÍTICAS RLS DO PROJETO
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 🔍 2. FOCAR NAS TABELAS QUE PRECISAM DE OTIMIZAÇÃO
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%' THEN '❌ NÃO OTIMIZADA'
    WHEN qual LIKE '%(SELECT auth.uid())%' THEN '✅ OTIMIZADA'
    ELSE '❓ OUTRA'
  END as status_otimizacao,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('notifications', 'projects', 'notebooks', 'calendar_events')
AND cmd = 'SELECT'
ORDER BY tablename;

-- 🔍 3. BUSCAR POLÍTICAS COM "view" NO NOME
SELECT 
  tablename,
  policyname,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname ILIKE '%view%'
ORDER BY tablename;

-- 🔍 4. CONTAR POLÍTICAS POR ESTADO
SELECT 
  'Total de políticas' as categoria,
  COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Políticas com view no nome' as categoria,
  COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname ILIKE '%view%'

UNION ALL

SELECT 
  'Políticas não otimizadas (auth.uid direto)' as categoria,
  COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND qual LIKE '%auth.uid()%' 
AND qual NOT LIKE '%(SELECT auth.uid())%'

UNION ALL

SELECT 
  'Políticas otimizadas (SELECT auth.uid)' as categoria,
  COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public'
AND qual LIKE '%(SELECT auth.uid())%';

-- 🔍 5. VERIFICAR TABELA NOTIFICATIONS ESPECIFICAMENTE
SELECT 
  'notifications' as tabela,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'notifications'
ORDER BY policyname; 