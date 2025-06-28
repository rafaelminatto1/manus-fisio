-- VERIFICAÇÃO DAS CORREÇÕES APLICADAS

-- 1. RLS notification_settings
SELECT 'notification_settings RLS' as check_item,
       CASE WHEN c.relrowsecurity THEN 'OK' ELSE 'PENDENTE' END as status
FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'notification_settings';

-- 2. Funções search_path
SELECT p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as function_signature,
       CASE WHEN '' = ANY(p.proconfig) THEN 'OK' ELSE 'PENDENTE' END as status
FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_mentor', 'log_activity');

-- 3. Índice crítico
SELECT 'idx_calendar_events_created_by' as index_name,
       CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'PENDENTE' END as status
FROM pg_indexes WHERE indexname = 'idx_calendar_events_created_by'; 