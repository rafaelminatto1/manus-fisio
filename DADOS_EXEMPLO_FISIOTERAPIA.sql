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

(uuid_generate_v4(), 'Rotação Externa com Theraband', 'Fortalecimento dos rotadores externos do ombro', 'strengthening', ARRAY['shoulder'], 3, ARRAY['theraband'], ARRAY['instabilidade severa'], 3, 15, 0, ARRAY['Cotovelo colado ao corpo', 'Segure a faixa elástica', 'Rode o braço para fora contra a resistência', 'Retorne controladamente'], ARRAY['impacto do ombro', 'instabilidade'], (SELECT id FROM users WHERE role = 'admin' LIMIT 1), true);

-- 2. PACIENTES DE EXEMPLO COM HISTÓRICO REALISTA
INSERT INTO patients (id, full_name, email, phone, birth_date, address, cpf, emergency_contact_name, emergency_contact_phone, gender, initial_medical_history, created_by) VALUES

(uuid_generate_v4(), 'Maria Silva Santos', 'maria.silva@email.com', '(11) 98765-4321', '1975-03-15', 'Rua das Flores, 123 - São Paulo, SP', '123.456.789-01', 'João Santos', '(11) 99988-7766', 'F', 'Lombalgia crônica há 2 anos. Trabalha como secretária. Sedentária.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),

(uuid_generate_v4(), 'José Carlos Oliveira', 'jose.oliveira@email.com', '(11) 91234-5678', '1965-08-22', 'Av. Paulista, 456 - São Paulo, SP', '987.654.321-02', 'Ana Oliveira', '(11) 97766-5544', 'M', 'Pós-cirúrgico de ombro esquerdo (manguito rotador). Engenheiro.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),

(uuid_generate_v4(), 'Ana Paula Costa', 'ana.costa@email.com', '(11) 95555-1234', '1988-12-03', 'Rua dos Pinheiros, 789 - São Paulo, SP', '456.789.123-03', 'Carlos Costa', '(11) 96633-2211', 'F', 'Cervicalgia e cefaleia tensional. Trabalha com computador 8h/dia.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),

(uuid_generate_v4(), 'Roberto Fernandes', 'roberto.fernandes@email.com', '(11) 92222-9999', '1955-05-18', 'Rua da Consolação, 321 - São Paulo, SP', '321.654.987-04', 'Marlene Fernandes', '(11) 94455-6677', 'M', 'Gonartrose bilateral grau II. Aposentado. Hipertensão controlada.', (SELECT id FROM users WHERE role = 'admin' LIMIT 1));

-- Comentário de sucesso
SELECT 
  '🎉 DADOS DE EXEMPLO CRIADOS!' as status,
  'Execute este arquivo no Supabase para popular o sistema' as instrucao; 