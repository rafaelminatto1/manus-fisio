-- ===============================================
-- CRIAÇÃO DE ÍNDICES CONCURRENTLY - MANUS FISIO  
-- EXECUTAR SEPARADAMENTE, FORA DE TRANSAÇÃO
-- ===============================================

-- IMPORTANTE: Execute estes comandos um por vez no Supabase SQL Editor
-- Não execute dentro de uma transação BEGIN/COMMIT

-- 1. Índice crítico para performance de calendar_events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_created_by 
ON calendar_events(created_by);

-- 2. Índices adicionais para otimização (opcional)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_created 
ON activity_logs(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_date_range 
ON calendar_events(start_time, end_time);

-- ===============================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- ===============================================

/*
COMO EXECUTAR:

1. Abra o Supabase Dashboard
2. Vá para SQL Editor  
3. Execute cada comando INDIVIDUALMENTE (um por vez)
4. Aguarde conclusão antes do próximo

VANTAGENS DO CONCURRENTLY:
✅ Não bloqueia a tabela durante criação
✅ Sistema continua funcionando normalmente
✅ Seguro para produção

TEMPO ESTIMADO:
- Cada índice: 10-30 segundos
- Total: 2-3 minutos

VERIFICAÇÃO:
Após executar, verifique se os índices foram criados:

SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
*/ 