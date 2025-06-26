-- Simple sample data for testing the physiotherapy clinic system
-- This version creates minimal sample data without auth.users conflicts

-- Temporarily disable the foreign key constraint to allow test data
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Clear existing data
TRUNCATE users, notebooks, pages, projects, tasks, mentorships, comments, notebook_collaborators, project_collaborators RESTART IDENTITY CASCADE;

-- Insert sample users directly (for testing purposes)
INSERT INTO users (id, email, full_name, role, crefito, specialty, university, semester) VALUES
    ('11111111-1111-1111-1111-111111111111', 'rafael.santos@clinica.com', 'Dr. Rafael Santos', 'mentor', 'CREFITO-3/12345-F', 'Fisioterapia Ortopédica', NULL, NULL),
    ('22222222-2222-2222-2222-222222222222', 'ana.lima@clinica.com', 'Dra. Ana Lima', 'mentor', 'CREFITO-3/67890-F', 'Fisioterapia Neurológica', NULL, NULL),
    ('44444444-4444-4444-4444-444444444444', 'maria.silva@usp.br', 'Maria Silva', 'intern', NULL, NULL, 'USP - Universidade de São Paulo', 8),
    ('55555555-5555-5555-5555-555555555555', 'pedro.alves@unifesp.br', 'Pedro Alves', 'intern', NULL, NULL, 'UNIFESP - Universidade Federal de São Paulo', 9),
    ('00000000-0000-0000-0000-000000000000', 'admin@clinica.com', 'Administrador Sistema', 'admin', 'CREFITO-3/00000-F', 'Gestão Clínica', NULL, NULL);

-- Sample notebooks
INSERT INTO notebooks (id, title, description, icon, category, is_public, created_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolos de Reabilitação', 'Protocolos padronizados para diferentes tipos de reabilitação', '🏥', 'protocols', true, '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fisioterapia Neurológica', 'Técnicas e abordagens para reabilitação neurológica', '🧠', 'specialties', true, '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Material Didático', 'Conteúdo educacional para estagiários', '📚', 'education', false, '11111111-1111-1111-1111-111111111111');

-- Sample pages
INSERT INTO pages (id, notebook_id, title, content, slug, order_index, is_published, created_by) VALUES
    ('page0001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolo LCA - Introdução', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Reabilitação para Lesão de LCA"}]},{"type":"paragraph","content":[{"type":"text","text":"Este protocolo estabelece as diretrizes para o tratamento fisioterapêutico de pacientes com lesão do ligamento cruzado anterior."}]}]}', 'protocolo-lca-introducao', 1, true, '11111111-1111-1111-1111-111111111111'),
    ('page0002-0002-0002-0002-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Avaliação Neurológica', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Avaliação Neurológica"}]},{"type":"paragraph","content":[{"type":"text","text":"Diretrizes para avaliação fisioterapêutica em pacientes neurológicos."}]}]}', 'avaliacao-neurologica', 1, true, '22222222-2222-2222-2222-222222222222');

-- Sample projects
INSERT INTO projects (id, title, description, status, priority, due_date, progress, created_by) VALUES
    ('proj0001-0001-0001-0001-000000000001', 'Reabilitação Pós-Cirúrgica - João Silva', 'Protocolo de reabilitação após cirurgia de LCA', 'active', 'high', '2024-02-15', 58, '11111111-1111-1111-1111-111111111111'),
    ('proj0002-0002-0002-0002-000000000002', 'Fisioterapia Neurológica - Ana Costa', 'Tratamento para hemiplegia pós-AVC', 'planning', 'medium', '2024-02-28', 25, '22222222-2222-2222-2222-222222222222');

-- Sample tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, order_index, created_by) VALUES
    ('task0001-0001-0001-0001-000000000001', 'proj0001-0001-0001-0001-000000000001', 'Avaliação inicial', 'Realizar avaliação fisioterapêutica completa', 'done', 'high', '44444444-4444-4444-4444-444444444444', '2024-01-10', 2, 2, 1, '11111111-1111-1111-1111-111111111111'),
    ('task0002-0002-0002-0002-000000000002', 'proj0001-0001-0001-0001-000000000001', 'Fase 1 - Controle da dor', 'Aplicar técnicas para controle da dor e edema', 'in_progress', 'high', '44444444-4444-4444-4444-444444444444', '2024-01-15', 4, 2, 2, '11111111-1111-1111-1111-111111111111');

-- Sample mentorships
INSERT INTO mentorships (id, mentor_id, intern_id, status, start_date, required_hours, completed_hours, notes) VALUES
    ('ment0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'active', '2024-01-02', 400, 180, 'Estagiária com excelente evolução na área ortopédica'),
    ('ment0002-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'active', '2024-01-08', 300, 45, 'Estagiário iniciante, necessita acompanhamento próximo');

-- Sample collaborators
INSERT INTO notebook_collaborators (notebook_id, user_id, permission) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'read'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'read');

INSERT INTO project_collaborators (project_id, user_id, permission) VALUES
    ('proj0001-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'write'),
    ('proj0002-0002-0002-0002-000000000002', '55555555-5555-5555-5555-555555555555', 'write');

-- Sample comments
INSERT INTO comments (id, content, author_id, page_id, created_at) VALUES
    ('comm0001-0001-0001-0001-000000000001', 'Excelente protocolo! Muito útil para a prática clínica.', '44444444-4444-4444-4444-444444444444', 'page0001-0001-0001-0001-000000000001', '2024-01-10 14:30:00'),
    ('comm0002-0002-0002-0002-000000000002', 'Obrigado pelo feedback! Vou continuar aprimorando.', '11111111-1111-1111-1111-111111111111', 'page0001-0001-0001-0001-000000000001', '2024-01-10 15:45:00');

-- Note: Foreign key constraint remains disabled for testing
-- In production, re-enable with: ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; 