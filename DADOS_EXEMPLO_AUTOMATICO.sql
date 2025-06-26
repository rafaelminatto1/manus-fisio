-- DADOS DE EXEMPLO PARA O SISTEMA MANUS FISIO
-- Este arquivo usa uuid_generate_v4() para gerar UUIDs válidos automaticamente

-- Remover constraint temporariamente para inserir dados de teste
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Limpar dados existentes
TRUNCATE users, notebooks, pages, projects, tasks, mentorships, comments, notebook_collaborators, project_collaborators RESTART IDENTITY CASCADE;

-- Inserir usuários de exemplo
INSERT INTO users (id, email, full_name, role, crefito, specialty, university, semester) VALUES
    (uuid_generate_v4(), 'rafael.santos@clinica.com', 'Dr. Rafael Santos', 'mentor', 'CREFITO-3/12345-F', 'Fisioterapia Ortopédica', NULL, NULL),
    (uuid_generate_v4(), 'ana.lima@clinica.com', 'Dra. Ana Lima', 'mentor', 'CREFITO-3/67890-F', 'Fisioterapia Neurológica', NULL, NULL),
    (uuid_generate_v4(), 'maria.silva@usp.br', 'Maria Silva', 'intern', NULL, NULL, 'USP - Universidade de São Paulo', 8),
    (uuid_generate_v4(), 'pedro.alves@unifesp.br', 'Pedro Alves', 'intern', NULL, NULL, 'UNIFESP - Universidade Federal de São Paulo', 9),
    (uuid_generate_v4(), 'admin@clinica.com', 'Administrador Sistema', 'admin', 'CREFITO-3/00000-F', 'Gestão Clínica', NULL, NULL);

-- Inserir notebooks usando os IDs dos usuários criados
INSERT INTO notebooks (id, title, description, icon, category, is_public, created_by)
SELECT 
    uuid_generate_v4(),
    'Protocolos de Reabilitação',
    'Protocolos padronizados para diferentes tipos de reabilitação',
    '🏥',
    'protocols',
    true,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1);

INSERT INTO notebooks (id, title, description, icon, category, is_public, created_by)
SELECT 
    uuid_generate_v4(),
    'Fisioterapia Neurológica',
    'Técnicas e abordagens para reabilitação neurológica',
    '🧠',
    'specialties',
    true,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at OFFSET 1 LIMIT 1);

INSERT INTO notebooks (id, title, description, icon, category, is_public, created_by)
SELECT 
    uuid_generate_v4(),
    'Material Didático',
    'Conteúdo educacional para estagiários',
    '📚',
    'education',
    false,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1);

-- Inserir páginas
INSERT INTO pages (id, notebook_id, title, content, slug, order_index, is_published, created_by)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM notebooks WHERE title = 'Protocolos de Reabilitação'),
    'Protocolo LCA - Introdução',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Reabilitação para Lesão de LCA"}]}]}',
    'protocolo-lca-introducao',
    1,
    true,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1);

INSERT INTO pages (id, notebook_id, title, content, slug, order_index, is_published, created_by)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM notebooks WHERE title = 'Fisioterapia Neurológica'),
    'Avaliação Neurológica',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Avaliação Neurológica"}]}]}',
    'avaliacao-neurologica',
    1,
    true,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at OFFSET 1 LIMIT 1);

-- Inserir projetos
INSERT INTO projects (id, title, description, status, priority, due_date, progress, created_by)
SELECT 
    uuid_generate_v4(),
    'Reabilitação Pós-Cirúrgica - João Silva',
    'Protocolo de reabilitação após cirurgia de LCA',
    'active',
    'high',
    '2024-02-15',
    58,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1);

INSERT INTO projects (id, title, description, status, priority, due_date, progress, created_by)
SELECT 
    uuid_generate_v4(),
    'Fisioterapia Neurológica - Ana Costa',
    'Tratamento para hemiplegia pós-AVC',
    'planning',
    'medium',
    '2024-02-28',
    25,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at OFFSET 1 LIMIT 1);

-- Inserir tarefas
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, order_index, created_by)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM projects WHERE title = 'Reabilitação Pós-Cirúrgica - João Silva'),
    'Avaliação inicial',
    'Realizar avaliação fisioterapêutica completa',
    'done',
    'high',
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at LIMIT 1),
    '2024-01-10',
    2,
    2,
    1,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1);

INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, order_index, created_by)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM projects WHERE title = 'Reabilitação Pós-Cirúrgica - João Silva'),
    'Fase 1 - Controle da dor',
    'Aplicar técnicas para controle da dor e edema',
    'in_progress',
    'high',
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at LIMIT 1),
    '2024-01-15',
    4,
    2,
    2,
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1);

-- Inserir mentorias
INSERT INTO mentorships (id, mentor_id, intern_id, status, start_date, required_hours, completed_hours, notes)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1),
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at LIMIT 1),
    'active',
    '2024-01-02',
    400,
    180,
    'Estagiária com excelente evolução na área ortopédica';

INSERT INTO mentorships (id, mentor_id, intern_id, status, start_date, required_hours, completed_hours, notes)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at OFFSET 1 LIMIT 1),
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at OFFSET 1 LIMIT 1),
    'active',
    '2024-01-08',
    300,
    45,
    'Estagiário iniciante, necessita acompanhamento próximo';

-- Inserir colaboradores
INSERT INTO notebook_collaborators (notebook_id, user_id, permission)
SELECT 
    (SELECT id FROM notebooks WHERE title = 'Protocolos de Reabilitação'),
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at LIMIT 1),
    'read';

INSERT INTO notebook_collaborators (notebook_id, user_id, permission)
SELECT 
    (SELECT id FROM notebooks WHERE title = 'Fisioterapia Neurológica'),
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at OFFSET 1 LIMIT 1),
    'read';

INSERT INTO project_collaborators (project_id, user_id, permission)
SELECT 
    (SELECT id FROM projects WHERE title = 'Reabilitação Pós-Cirúrgica - João Silva'),
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at LIMIT 1),
    'write';

INSERT INTO project_collaborators (project_id, user_id, permission)
SELECT 
    (SELECT id FROM projects WHERE title = 'Fisioterapia Neurológica - Ana Costa'),
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at OFFSET 1 LIMIT 1),
    'write';

-- Inserir comentários
INSERT INTO comments (id, content, author_id, page_id, created_at)
SELECT 
    uuid_generate_v4(),
    'Excelente protocolo! Muito útil para a prática clínica.',
    (SELECT id FROM users WHERE role = 'intern' ORDER BY created_at LIMIT 1),
    (SELECT id FROM pages WHERE title = 'Protocolo LCA - Introdução'),
    '2024-01-10 14:30:00';

INSERT INTO comments (id, content, author_id, page_id, created_at)
SELECT 
    uuid_generate_v4(),
    'Obrigado pelo feedback! Vou continuar aprimorando.',
    (SELECT id FROM users WHERE role = 'mentor' ORDER BY created_at LIMIT 1),
    (SELECT id FROM pages WHERE title = 'Protocolo LCA - Introdução'),
    '2024-01-10 15:45:00';

-- Mostrar resumo dos dados inseridos
SELECT 'Dados inseridos com sucesso!' as status;
SELECT 'Usuários' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'Notebooks', COUNT(*) FROM notebooks
UNION ALL
SELECT 'Páginas', COUNT(*) FROM pages
UNION ALL
SELECT 'Projetos', COUNT(*) FROM projects
UNION ALL
SELECT 'Tarefas', COUNT(*) FROM tasks
UNION ALL
SELECT 'Mentorias', COUNT(*) FROM mentorships
UNION ALL
SELECT 'Comentários', COUNT(*) FROM comments;
