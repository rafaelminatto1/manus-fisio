-- Sample data for testing the physiotherapy clinic system

-- Insert sample users (in a real scenario, these would be created through auth)
-- Note: In production, users are created through Supabase Auth, this is for testing only

-- Sample mentors
INSERT INTO users (id, email, full_name, role, crefito, specialty) VALUES
    ('11111111-1111-1111-1111-111111111111', 'rafael.santos@clinica.com', 'Dr. Rafael Santos', 'mentor', 'CREFITO-3/12345-F', 'Fisioterapia Ortopédica'),
    ('22222222-2222-2222-2222-222222222222', 'ana.lima@clinica.com', 'Dra. Ana Lima', 'mentor', 'CREFITO-3/67890-F', 'Fisioterapia Neurológica'),
    ('33333333-3333-3333-3333-333333333333', 'carlos.oliveira@clinica.com', 'Dr. Carlos Oliveira', 'mentor', 'CREFITO-3/11111-F', 'Fisioterapia Respiratória');

-- Sample interns
INSERT INTO users (id, email, full_name, role, university, semester) VALUES
    ('44444444-4444-4444-4444-444444444444', 'maria.silva@usp.br', 'Maria Silva', 'intern', 'USP - Universidade de São Paulo', 8),
    ('55555555-5555-5555-5555-555555555555', 'pedro.alves@unifesp.br', 'Pedro Alves', 'intern', 'UNIFESP - Universidade Federal de São Paulo', 9),
    ('66666666-6666-6666-6666-666666666666', 'carlos.torres@pucsp.br', 'Carlos Torres', 'intern', 'PUC-SP - Pontifícia Universidade Católica', 7),
    ('77777777-7777-7777-7777-777777777777', 'julia.costa@usp.br', 'Julia Costa', 'intern', 'USP - Universidade de São Paulo', 8);

-- Sample admin
INSERT INTO users (id, email, full_name, role, crefito, specialty) VALUES
    ('00000000-0000-0000-0000-000000000000', 'admin@clinica.com', 'Administrador Sistema', 'admin', 'CREFITO-3/00000-F', 'Gestão Clínica');

-- Sample notebooks
INSERT INTO notebooks (id, title, description, icon, category, is_public, created_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolos de Reabilitação', 'Protocolos padronizados para diferentes tipos de reabilitação', '🏥', 'protocols', true, '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fisioterapia Neurológica', 'Técnicas e abordagens para reabilitação neurológica', '🧠', 'specialties', true, '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fisioterapia Ortopédica', 'Procedimentos para lesões músculo-esqueléticas', '🦴', 'specialties', true, '11111111-1111-1111-1111-111111111111'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Material Didático', 'Conteúdo educacional para estagiários e supervisão', '📚', 'education', false, '11111111-1111-1111-1111-111111111111'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Avaliação de Estagiários', 'Formulários e critérios para avaliação de competências', '📋', 'evaluation', false, '00000000-0000-0000-0000-000000000000');

-- Sample pages
INSERT INTO pages (id, notebook_id, title, content, slug, order_index, is_published, created_by) VALUES
    ('page0001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolo LCA - Introdução', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Reabilitação para Lesão de LCA"}]},{"type":"paragraph","content":[{"type":"text","text":"Este protocolo estabelece as diretrizes para o tratamento fisioterapêutico de pacientes com lesão do ligamento cruzado anterior."}]}]}', 'protocolo-lca-introducao', 1, true, '11111111-1111-1111-1111-111111111111'),
    ('page0002-0002-0002-0002-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Protocolo LCA - Fase Aguda', '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Fase Aguda (0-2 semanas)"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Controle da dor e edema"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Proteção da articulação"}]}]}]}]}', 'protocolo-lca-fase-aguda', 2, true, '11111111-1111-1111-1111-111111111111'),
    ('page0003-0003-0003-0003-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Avaliação Neurológica', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Protocolo de Avaliação Neurológica"}]},{"type":"paragraph","content":[{"type":"text","text":"Diretrizes para avaliação fisioterapêutica em pacientes neurológicos."}]}]}', 'avaliacao-neurologica', 1, true, '22222222-2222-2222-2222-222222222222'),
    ('page0004-0004-0004-0004-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Biomecânica da Coluna', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Biomecânica da Coluna Vertebral"}]},{"type":"paragraph","content":[{"type":"text","text":"Fundamentos biomecânicos para o tratamento de disfunções da coluna vertebral."}]}]}', 'biomecanica-coluna', 1, true, '11111111-1111-1111-1111-111111111111');

-- Sample projects
INSERT INTO projects (id, title, description, status, priority, due_date, progress, created_by) VALUES
    ('proj0001-0001-0001-0001-000000000001', 'Reabilitação Pós-Cirúrgica - João Silva', 'Protocolo de reabilitação após cirurgia de LCA para paciente João Silva', 'active', 'high', '2024-02-15', 58, '11111111-1111-1111-1111-111111111111'),
    ('proj0002-0002-0002-0002-000000000002', 'Fisioterapia Neurológica - Ana Costa', 'Tratamento para hemiplegia pós-AVC para paciente Ana Costa', 'planning', 'medium', '2024-02-28', 25, '22222222-2222-2222-2222-222222222222'),
    ('proj0003-0003-0003-0003-000000000003', 'Programa de Prevenção Escolar', 'Programa de ergonomia e prevenção para estudantes do ensino médio', 'on_hold', 'low', '2024-03-10', 33, '11111111-1111-1111-1111-111111111111'),
    ('proj0004-0004-0004-0004-000000000004', 'Pesquisa - Dor Lombar Crônica', 'Estudo comparativo de técnicas de tratamento para dor lombar crônica', 'completed', 'high', '2024-01-30', 100, '00000000-0000-0000-0000-000000000000');

-- Sample tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, order_index, created_by) VALUES
    ('task0001-0001-0001-0001-000000000001', 'proj0001-0001-0001-0001-000000000001', 'Avaliação inicial', 'Realizar avaliação fisioterapêutica completa', 'done', 'high', '44444444-4444-4444-4444-444444444444', '2024-01-10', 2, 2, 1, '11111111-1111-1111-1111-111111111111'),
    ('task0002-0002-0002-0002-000000000002', 'proj0001-0001-0001-0001-000000000001', 'Fase 1 - Controle da dor', 'Aplicar técnicas para controle da dor e edema', 'done', 'high', '44444444-4444-4444-4444-444444444444', '2024-01-15', 4, 4, 2, '11111111-1111-1111-1111-111111111111'),
    ('task0003-0003-0003-0003-000000000003', 'proj0001-0001-0001-0001-000000000001', 'Fase 2 - Mobilização', 'Iniciar mobilização articular passiva', 'in_progress', 'medium', '44444444-4444-4444-4444-444444444444', '2024-01-20', 3, 1, 3, '11111111-1111-1111-1111-111111111111'),
    ('task0004-0004-0004-0004-000000000004', 'proj0002-0002-0002-0002-000000000002', 'Avaliação neurológica', 'Avaliação completa do estado neurológico', 'todo', 'high', '55555555-5555-5555-5555-555555555555', '2024-01-25', 3, 0, 1, '22222222-2222-2222-2222-222222222222');

-- Sample mentorships
INSERT INTO mentorships (id, mentor_id, intern_id, status, start_date, end_date, required_hours, completed_hours, notes) VALUES
    ('ment0001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'active', '2024-01-02', NULL, 400, 180, 'Estagiária demonstra excelente evolução na área ortopédica'),
    ('ment0002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'active', '2023-08-15', NULL, 400, 350, 'Estagiário próximo à conclusão, excelente desempenho'),
    ('ment0003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'active', '2024-01-08', NULL, 300, 45, 'Estagiário iniciante, necessita acompanhamento próximo'),
    ('ment0004-0004-0004-0004-000000000004', '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'active', '2024-01-15', NULL, 400, 20, 'Estagiária com interesse em neurologia');

-- Sample collaborators
INSERT INTO notebook_collaborators (notebook_id, user_id, permission) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'write'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'read'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'write'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'read'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555', 'read');

INSERT INTO project_collaborators (project_id, user_id, permission) VALUES
    ('proj0001-0001-0001-0001-000000000001', '44444444-4444-4444-4444-444444444444', 'write'),
    ('proj0002-0002-0002-0002-000000000002', '55555555-5555-5555-5555-555555555555', 'write'),
    ('proj0003-0003-0003-0003-000000000003', '44444444-4444-4444-4444-444444444444', 'read'),
    ('proj0004-0004-0004-0004-000000000004', '11111111-1111-1111-1111-111111111111', 'read'),
    ('proj0004-0004-0004-0004-000000000004', '22222222-2222-2222-2222-222222222222', 'read');

-- Sample comments
INSERT INTO comments (id, content, author_id, page_id, created_at) VALUES
    ('comm0001-0001-0001-0001-000000000001', 'Excelente protocolo! Seria interessante adicionar mais detalhes sobre a progressão dos exercícios.', '44444444-4444-4444-4444-444444444444', 'page0001-0001-0001-0001-000000000001', '2024-01-10 14:30:00'),
    ('comm0002-0002-0002-0002-000000000002', 'Concordo com a Maria. Vou trabalhar na expansão desta seção.', '11111111-1111-1111-1111-111111111111', 'page0001-0001-0001-0001-000000000001', '2024-01-10 15:45:00');

INSERT INTO comments (id, content, author_id, task_id, created_at) VALUES
    ('comm0003-0003-0003-0003-000000000003', 'Tarefa concluída com sucesso. Paciente apresentou boa evolução.', '44444444-4444-4444-4444-444444444444', 'task0001-0001-0001-0001-000000000001', '2024-01-10 16:00:00'),
    ('comm0004-0004-0004-0004-000000000004', 'Ótimo trabalho! Continue com o mesmo protocolo na próxima fase.', '11111111-1111-1111-1111-111111111111', 'task0001-0001-0001-0001-000000000001', '2024-01-10 16:30:00'); 