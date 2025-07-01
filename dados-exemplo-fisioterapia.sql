-- =====================================================
-- DADOS DE EXEMPLO REALISTAS - SISTEMA DE FISIOTERAPIA
-- Data: 29/01/2025
-- =====================================================

-- 1. BIBLIOTECA DE EXERCÍCIOS REALISTA
INSERT INTO exercise_library (id, name, description, category, body_region, difficulty_level, equipment_needed, contraindications, default_sets, default_reps, default_hold_time, instruction_steps, recommended_conditions, created_by, is_active) VALUES

-- EXERCÍCIOS CERVICAIS
(uuid_generate_v4(), 'Flexão de Pescoço', 'Movimento de flexão cervical para alongamento da musculatura posterior', 'stretching', ARRAY['cervical'], 1, ARRAY[], ARRAY['hérnia cervical severa'], 1, 8, 15, ARRAY['Sentado ou em pé, mantenha os ombros relaxados', 'Flexione lentamente o pescoço para frente', 'Mantenha por 15 segundos', 'Retorne à posição inicial'], ARRAY['cervicalgia', 'tensão muscular'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

(uuid_generate_v4(), 'Rotação Cervical', 'Rotação lateral do pescoço para mobilidade articular', 'mobility', ARRAY['cervical'], 2, ARRAY[], ARRAY['vertigem'], 2, 10, 10, ARRAY['Sentado com coluna ereta', 'Gire lentamente a cabeça para um lado', 'Mantenha por 10 segundos', 'Retorne ao centro e repita para o outro lado'], ARRAY['rigidez cervical'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

-- EXERCÍCIOS LOMBARES
(uuid_generate_v4(), 'Flexão de Quadril em Decúbito', 'Flexão alternada de quadril para fortalecimento do core', 'strengthening', ARRAY['lumbar', 'hip'], 2, ARRAY[], ARRAY['hérnia lombar aguda'], 3, 12, 0, ARRAY['Deitado de costas, pernas estendidas', 'Flexione um joelho em direção ao peito', 'Mantenha por 3 segundos', 'Retorne à posição inicial', 'Alterne as pernas'], ARRAY['lombalgia', 'fraqueza do core'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

(uuid_generate_v4(), 'Ponte Glutea', 'Fortalecimento dos glúteos e estabilização lombar', 'strengthening', ARRAY['lumbar', 'hip'], 3, ARRAY[], ARRAY['dor lombar aguda'], 3, 15, 3, ARRAY['Deitado de costas, joelhos flexionados', 'Contraia os glúteos', 'Eleve o quadril formando uma linha reta', 'Mantenha por 3 segundos', 'Desça controladamente'], ARRAY['lombalgia', 'fraqueza glutea'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

-- EXERCÍCIOS DE OMBRO
(uuid_generate_v4(), 'Elevação Frontal com Bastão', 'Mobilização ativa-assistida do ombro', 'mobility', ARRAY['shoulder'], 2, ARRAY['bastão'], ARRAY['luxação recente'], 2, 12, 5, ARRAY['Segure o bastão com ambas as mãos', 'Eleve os braços para frente até onde conseguir', 'Mantenha por 5 segundos', 'Retorne controladamente'], ARRAY['capsulite adesiva', 'pós-cirúrgico'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

(uuid_generate_v4(), 'Rotação Externa com Theraband', 'Fortalecimento dos rotadores externos do ombro', 'strengthening', ARRAY['shoulder'], 3, ARRAY['theraband'], ARRAY['instabilidade severa'], 3, 15, 0, ARRAY['Cotovelo colado ao corpo', 'Segure a faixa elástica', 'Rode o braço para fora contra a resistência', 'Retorne controladamente'], ARRAY['impacto do ombro', 'instabilidade'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

-- EXERCÍCIOS DE JOELHO
(uuid_generate_v4(), 'Extensão de Joelho Sentado', 'Fortalecimento do quadríceps', 'strengthening', ARRAY['knee'], 2, ARRAY[], ARRAY['dor anterior severa'], 3, 12, 3, ARRAY['Sentado com as costas apoiadas', 'Estenda lentamente o joelho', 'Mantenha por 3 segundos', 'Desça controladamente'], ARRAY['condromalácia', 'pós-cirúrgico'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true),

(uuid_generate_v4(), 'Agachamento Parcial', 'Fortalecimento funcional do joelho', 'strengthening', ARRAY['knee', 'hip'], 4, ARRAY[], ARRAY['dor severa'], 3, 10, 0, ARRAY['Em pé, pés na largura dos ombros', 'Desça lentamente como se fosse sentar', 'Não ultrapasse 45 graus', 'Suba controladamente'], ARRAY['gonartrose', 'fortalecimento geral'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true);

-- 2. PACIENTES DE EXEMPLO
INSERT INTO patients (id, full_name, email, phone, birth_date, address, cpf, emergency_contact_name, emergency_contact_phone, gender, initial_medical_history, created_by) VALUES

(uuid_generate_v4(), 'Maria Silva Santos', 'maria.silva@email.com', '(11) 98765-4321', '1975-03-15', 'Rua das Flores, 123 - São Paulo, SP', '123.456.789-01', 'João Santos', '(11) 99988-7766', 'F', 'Lombalgia crônica há 2 anos. Trabalha como secretária.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),

(uuid_generate_v4(), 'José Carlos Oliveira', 'jose.oliveira@email.com', '(11) 91234-5678', '1965-08-22', 'Av. Paulista, 456 - São Paulo, SP', '987.654.321-02', 'Ana Oliveira', '(11) 97766-5544', 'M', 'Pós-cirúrgico de ombro esquerdo (manguito rotador). Engenheiro.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),

(uuid_generate_v4(), 'Ana Paula Costa', 'ana.costa@email.com', '(11) 95555-1234', '1988-12-03', 'Rua dos Pinheiros, 789 - São Paulo, SP', '456.789.123-03', 'Carlos Costa', '(11) 96633-2211', 'F', 'Cervicalgia e cefaleia tensional. Trabalha com computador 8h/dia.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),

(uuid_generate_v4(), 'Roberto Fernandes', 'roberto.fernandes@email.com', '(11) 92222-9999', '1955-05-18', 'Rua da Consolação, 321 - São Paulo, SP', '321.654.987-04', 'Marlene Fernandes', '(11) 94455-6677', 'M', 'Gonartrose bilateral grau II. Aposentado.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

-- 3. AVALIAÇÕES FISIOTERAPÊUTICAS
INSERT INTO physiotherapy_evaluations (id, patient_id, evaluator_id, evaluation_date, main_complaint, pain_scale_initial, pain_location, pain_characteristics, medical_history, previous_treatments, medications, lifestyle_factors, posture_analysis, clinical_diagnosis, physiotherapy_diagnosis, treatment_goals, estimated_sessions, frequency_per_week) VALUES

-- Avaliação da Maria Silva
((SELECT id FROM patients WHERE full_name = 'Maria Silva Santos' LIMIT 1), (SELECT id FROM patients WHERE full_name = 'Maria Silva Santos' LIMIT 1), (SELECT id FROM users WHERE role = 'admin' LIMIT 1), '2025-01-20', 'Dor na região lombar que piora ao sentar por muito tempo', 7, 'Região lombar baixa, bilateralmente', 'Dor em peso, às vezes queimação', 'Sem comorbidades importantes', 'Fez fisioterapia há 1 ano com melhora parcial', 'Ibuprofeno 400mg - SOS', 'Sedentária, trabalha 8h sentada, não pratica exercícios', 'Hipercifose torácica, anteversão de cabeça, hiperlordose lombar compensatória', 'Lombalgia mecânica inespecífica', 'Disfunção cinético-funcional da coluna lombar com padrão flexor encurtado e fraqueza do core', ARRAY['Reduzir dor para nível 3', 'Melhorar flexibilidade lombar', 'Fortalecer musculatura estabilizadora'], 16, 2),

-- Avaliação do José Carlos
((SELECT id FROM patients WHERE full_name = 'José Carlos Oliveira' LIMIT 1), (SELECT id FROM patients WHERE full_name = 'José Carlos Oliveira' LIMIT 1), (SELECT id FROM users WHERE role = 'admin' LIMIT 1), '2025-01-22', 'Dificuldade para elevar o braço esquerdo acima da cabeça', 5, 'Ombro esquerdo, região anterior e lateral', 'Dor em pontada durante movimento', 'Cirurgia de reparo do manguito rotador há 3 meses', 'Fisioterapia no hospital por 6 semanas pós-cirúrgico', 'Paracetamol 750mg 8/8h', 'Ativo, pratica caminhada, trabalho não requer esforço físico', 'Ombro esquerdo em posição protetiva, elevação da escápula', 'Pós-operatório de reparo do manguito rotador', 'Limitação de ADM de ombro esquerdo com aderências cicatriciais e fraqueza muscular', ARRAY['Recuperar ADM completa', 'Fortalecer manguito rotador', 'Retornar às atividades normais'], 20, 3);

-- 4. PRESCRIÇÕES DE EXERCÍCIOS
INSERT INTO exercise_prescriptions (id, patient_id, prescribed_by, evaluation_id, prescription_date, title, description, frequency_per_week, duration_weeks, status) VALUES

-- Prescrição para Maria Silva
(uuid_generate_v4(), (SELECT id FROM patients WHERE full_name = 'Maria Silva Santos' LIMIT 1), (SELECT id FROM users WHERE role = 'admin' LIMIT 1), (SELECT id FROM physiotherapy_evaluations WHERE patient_id = (SELECT id FROM patients WHERE full_name = 'Maria Silva Santos' LIMIT 1) LIMIT 1), '2025-01-20', 'Protocolo Lombalgia - Fase Inicial', 'Exercícios para alívio da dor e mobilização inicial da coluna lombar', 3, 4, 'active'),

-- Prescrição para José Carlos
(uuid_generate_v4(), (SELECT id FROM patients WHERE full_name = 'José Carlos Oliveira' LIMIT 1), (SELECT id FROM users WHERE role = 'admin' LIMIT 1), (SELECT id FROM physiotherapy_evaluations WHERE patient_id = (SELECT id FROM patients WHERE full_name = 'José Carlos Oliveira' LIMIT 1) LIMIT 1), '2025-01-22', 'Reabilitação Pós-Cirúrgica Ombro - Fase 2', 'Exercícios para ganho de amplitude e fortalecimento inicial do ombro esquerdo', 5, 6, 'active');

-- 5. DADOS ADICIONAIS PARA DASHBOARD
INSERT INTO notebooks (title, description, category, created_by) VALUES
('Protocolos de Fisioterapia', 'Protocolos padronizados para diferentes patologias', 'Clinical Protocols', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
('Casos Clínicos Complexos', 'Documentação de casos clínicos especiais', 'Case Studies', (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

INSERT INTO projects (title, description, status, priority, created_by) VALUES
('Implementação de Protocolos EVA', 'Padronização do uso da escala visual analógica', 'active', 'high', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
('Treinamento Goniometria Digital', 'Capacitação da equipe no uso do goniômetro digital', 'planning', 'medium', (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

-- 6. COMENTÁRIOS EXPLICATIVOS
COMMENT ON TABLE physiotherapy_evaluations IS 'Avaliações fisioterapêuticas completas com todos os dados da primeira consulta';
COMMENT ON TABLE exercise_library IS 'Biblioteca de exercícios categorizados por região corporal e tipo';
COMMENT ON TABLE exercise_prescriptions IS 'Prescrições personalizadas de exercícios para cada paciente';

-- 7. ATUALIZAR CONTADORES
UPDATE users SET 
  created_at = NOW() - INTERVAL '30 days',
  updated_at = NOW()
WHERE role = 'admin';

-- Mensagem de sucesso
SELECT 
  '🎉 DADOS DE EXEMPLO CRIADOS COM SUCESSO!' as status,
  '✅ ' || COUNT(*) || ' exercícios adicionados' as exercises,
  '👥 ' || (SELECT COUNT(*) FROM patients) || ' pacientes cadastrados' as patients,
  '📋 ' || (SELECT COUNT(*) FROM physiotherapy_evaluations) || ' avaliações realizadas' as evaluations
FROM exercise_library; 