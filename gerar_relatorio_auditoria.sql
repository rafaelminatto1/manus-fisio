
-- =================================================================
-- GERAR RELATÓRIO DE AUDITORIA (AUDIT TRAIL) - LGPD
-- =================================================================
-- Este script gera um relatório de auditoria legível para humanos
-- a partir da tabela activity_logs, focando em ações que podem
-- envolver dados pessoais sensíveis.

-- Seleciona e formata os dados da tabela de logs
SELECT
    al.created_at AS "Data/Hora da Ação",
    u.email AS "Usuário",
    al.action AS "Ação",
    al.entity_type AS "Entidade Afetada",
    al.entity_id AS "ID da Entidade",
    -- Detalhes sobre o que foi alterado
    CASE
        WHEN al.action = 'INSERT' THEN 'Novo registro criado: ' || (al.new_values ->> 'title' )
        WHEN al.action = 'UPDATE' THEN 'Registro atualizado. Campo(s) alterado(s): ' || (SELECT string_agg(key, ', ') FROM jsonb_object_keys(al.new_values) WHERE al.new_values -> key <> al.old_values -> key)
        WHEN al.action = 'DELETE' THEN 'Registro deletado. Dados antigos: ' || (al.old_values ->> 'title')
        ELSE 'Ação desconhecida'
    END AS "Detalhes da Alteração",
    al.ip_address AS "Endereço IP"
FROM
    activity_logs al
LEFT JOIN
    users u ON al.user_id = u.id
-- Filtra por entidades que mais provavelmente contêm dados sensíveis
WHERE
    al.entity_type IN ('users', 'projects', 'tasks', 'mentorships', 'notebooks', 'pages')
ORDER BY
    al.created_at DESC;

