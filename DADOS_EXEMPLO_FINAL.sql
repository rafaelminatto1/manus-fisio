-- DADOS DE EXEMPLO PARA O SISTEMA MANUS FISIO
-- Copie e cole este código no SQL Editor do Supabase

-- Remover constraint temporariamente para inserir dados de teste
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Limpar dados existentes
TRUNCATE users, notebooks, pages, projects, tasks, mentorships, comments, notebook_collaborators, project_collaborators RESTART IDENTITY CASCADE;

-- Inserir usuários de exemplo
INSERT INTO users (id, email, full_name, role, crefito, specialty, university, semester) VALUES
    ('11111111-1111-1111-1111-111111111111', 'rafael.santos@clinica.com', 'Dr. Rafael Santos', 'mentor', 'CREFITO-3/12345-F', 'Fisioterapia Ortopédica', NULL, NULL),
    ('22222222-2222-2222-2222-222222222222', 'ana.lima@clinica.com', 'Dra. Ana Lima', 'mentor', 'CREFITO-3/67890-F', 'Fisioterapia Neurológica', NULL, NULL),
    ('44444444-4444-4444-4444-444444444444', 'maria.silva@usp.br', 'Maria Silva', 'intern', NULL, NULL, 'USP - Universidade de São Paulo', 8),
    ('55555555-5555-5555-5555-555555555555', 'pedro.alves@unifesp.br', 'Pedro Alves', 'intern', NULL, NULL, 'UNIFESP - Universidade Federal de São Paulo', 9),
    ('00000000-0000-0000-0000-000000000000', 'admin@clinica.com', 'Administrador Sistema', 'admin', 'CREFITO-3/00000-F', 'Gestão Clínica', NULL, NULL);

-- Inserir notebooks de exemplo
INSERT INTO notebooks (id, title, description, icon, category, is_public, created_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolos de Reabilitação', 'Protocolos padronizados para diferentes tipos de reabilitação', '🏥', 'protocols', true, '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fisioterapia Neurológica', 'Técnicas e abordagens para reabilitação neurológica', '🧠', 'specialties', true, '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Material Didático', 'Conteúdo educacional para estagiários', '📚', 'education', false, '11111111-1111-1111-1111-111111111111');

-- Inserir páginas de exemplo
INSERT INTO pages (id, notebook_id, title, content, slug, order_index, is_published, created_by) VALUES
    ('a0000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolo LCA - Introdução', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Reabilitação para Lesão de LCA"}]}]}', 'protocolo-lca-introducao', 1, true, '11111111-1111-1111-1111-111111111111'),
    ('b0000002-0002-0002-0002-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Avaliação Neurológica', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Avaliação Neurológica"}]}]}', 'avaliacao-neurologica', 1, true, '22222222-2222-2222-2222-222222222222');

-- Inserir projetos de exemplo
INSERT INTO projects (id, title, description, status, priority, due_date, progress, created_by) VALUES
    ('c0000001-0001-0001-0001-000000000001', 'Reabilitação Pós-Cirúrgica - João Silva', 'Protocolo de reabilitação após cirurgia de LCA', 'active', 'high', '2024-02-15', 58, '11111111-1111-1111-1111-111111111111'),
    ('d0000002-0002-0002-0002-000000000002', 'Fisioterapia Neurológica - Ana Costa', 'Tratamento para hemiplegia pós-AVC', 'planning', 'medium', '2024-02-28', 25, '22222222-2222-2222-2222-222222222222');

-- Inserir tarefas de exemplo
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, order_index, created_by) VALUES
    ('e0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000001', 'Avaliação inicial', 'Realizar avaliação fisioterapêutica completa', 'done', 'high', '44444444-4444-4444-4444-444444444444', '2024-01-10', 2, 2, 1, '11111111-1111-1111-1111-111111111111'),
    ('f0000002-0002-0002-0002-000000000002', 'c0000001-0001-0001-0001-000000000001', 'Fase 1 - Controle da dor', 'Aplicar técnicas para controle da dor e edema', 'in_progress', 'high', '44444444-4444-4444-4444-444444444444', '2024-01-15', 4, 2, 2, '11111111-1111-1111-1111-111111111111');

-- Inserir relacionamentos de mentoria
INSERT INTO mentorships (id, mentor_id, intern_id, status, start_date, required_hours, completed_hours, notes) VALUES
    ('g0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'active', '2024-01-02', 400, 180, 'Estagiária com excelente evolução na área ortopédica'),
    ('h0000002-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'active', '2024-01-08', 300, 45, 'Estagiário iniciante, necessita acompanhamento próximo');

-- Inserir colaboradores
INSERT INTO notebook_collaborators (notebook_id, user_id, permission) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'read'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'read');

INSERT INTO project_collaborators (project_id, user_id, permission) VALUES
    ('c0000001-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'write'),
    ('d0000002-0002-0002-0002-000000000002', '55555555-5555-5555-5555-555555555555', 'write');

-- Inserir comentários de exemplo
INSERT INTO comments (id, content, author_id, page_id, created_at) VALUES
    ('i0000001-0001-0001-0001-000000000001', 'Excelente protocolo! Muito útil para a prática clínica.', '44444444-4444-4444-4444-444444444444', 'a0000001-0001-0001-0001-000000000001', '2024-01-10 14:30:00'),
    ('j0000002-0002-0002-0002-000000000002', 'Obrigado pelo feedback! Vou continuar aprimorando.', '11111111-1111-1111-1111-111111111111', 'a0000001-0001-0001-0001-000000000001', '2024-01-10 15:45:00');

-- Constraint permanece desabilitada para testes
-- Para reativar em produção: ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; 