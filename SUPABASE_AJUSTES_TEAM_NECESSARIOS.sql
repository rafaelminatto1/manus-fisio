-- 🔧 AJUSTES NECESSÁRIOS NO SUPABASE PARA PÁGINA DE EQUIPE
-- Execute este script no SQL Editor do Supabase Dashboard

-- ✅ 1. ADICIONAR COLUNA is_active NA TABELA USERS
-- O código da página /team espera essa coluna para filtrar usuários ativos
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ✅ 2. AJUSTAR NOMES DAS COLUNAS NA TABELA MENTORSHIPS
-- O código espera hours_completed e hours_required, mas a tabela tem completed_hours e required_hours
ALTER TABLE mentorships 
ADD COLUMN IF NOT EXISTS hours_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hours_required INTEGER DEFAULT 300;

-- ✅ 3. COPIAR DADOS DAS COLUNAS ANTIGAS PARA AS NOVAS
UPDATE mentorships 
SET 
  hours_completed = COALESCE(completed_hours, 0),
  hours_required = COALESCE(required_hours, 300)
WHERE hours_completed IS NULL OR hours_required IS NULL;

-- ✅ 4. ADICIONAR COLUNA GOALS QUE O CÓDIGO ESPERA
ALTER TABLE mentorships 
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;

-- ✅ 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(status);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_intern_id ON mentorships(intern_id);

-- ✅ 6. ATUALIZAR USUÁRIOS EXISTENTES PARA ATIVO
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- ✅ 7. ADICIONAR DADOS DE EXEMPLO PARA TESTE (OPCIONAL)
-- Inserir alguns mentores e estagiários de exemplo se não existirem

-- Verificar se existem mentores
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'mentor') THEN
    -- Inserir mentor de exemplo
    INSERT INTO users (email, full_name, role, crefito, specialty, is_active)
    VALUES 
      ('mentor@clinica.com', 'Dr. João Silva', 'mentor', 'CREFITO-3/12345-F', 'Fisioterapia Ortopédica', true),
      ('mentor2@clinica.com', 'Dra. Maria Santos', 'mentor', 'CREFITO-3/67890-F', 'Fisioterapia Neurológica', true);
  END IF;
END $$;

-- Verificar se existem estagiários
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'intern') THEN
    -- Inserir estagiários de exemplo
    INSERT INTO users (email, full_name, role, university, semester, is_active)
    VALUES 
      ('estagiario1@usp.br', 'Ana Costa', 'intern', 'USP - Universidade de São Paulo', 8, true),
      ('estagiario2@usp.br', 'Pedro Oliveira', 'intern', 'UNIFESP - Universidade Federal de São Paulo', 7, true);
  END IF;
END $$;

-- ✅ 8. CRIAR MENTORIA DE EXEMPLO (OPCIONAL)
-- Inserir mentoria de exemplo se não existir
DO $$
DECLARE
  mentor_id UUID;
  intern_id UUID;
BEGIN
  -- Buscar IDs de mentor e estagiário
  SELECT id INTO mentor_id FROM users WHERE role = 'mentor' LIMIT 1;
  SELECT id INTO intern_id FROM users WHERE role = 'intern' LIMIT 1;
  
  -- Inserir mentoria se ambos existirem e não houver mentoria
  IF mentor_id IS NOT NULL AND intern_id IS NOT NULL 
     AND NOT EXISTS (SELECT 1 FROM mentorships WHERE mentor_id = mentor_id AND intern_id = intern_id) THEN
    
    INSERT INTO mentorships (
      mentor_id, 
      intern_id, 
      status, 
      start_date, 
      hours_completed, 
      hours_required,
      goals,
      notes
    )
    VALUES (
      mentor_id,
      intern_id,
      'active',
      CURRENT_DATE,
      120,
      400,
      '["Dominar técnicas de avaliação", "Desenvolver habilidades manuais", "Aprender protocolos de reabilitação"]'::jsonb,
      'Mentoria iniciada com foco em fisioterapia ortopédica'
    );
  END IF;
END $$;

-- ✅ 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN users.is_active IS 'Indica se o usuário está ativo no sistema';
COMMENT ON COLUMN mentorships.goals IS 'Objetivos da mentoria em formato JSON';
COMMENT ON COLUMN mentorships.hours_completed IS 'Horas completadas na mentoria';
COMMENT ON COLUMN mentorships.hours_required IS 'Horas requeridas para completar a mentoria';

-- ✅ 10. VERIFICAR RESULTADOS
SELECT 'Usuários por role:' as info, role, COUNT(*) as total
FROM users 
GROUP BY role
UNION ALL
SELECT 'Mentorias por status:' as info, status, COUNT(*) as total
FROM mentorships 
GROUP BY status;

-- 🎯 INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- 5. Verifique se não há erros
-- 6. Teste a página /team novamente

-- ✅ APÓS EXECUTAR ESTE SCRIPT:
-- - A página /team funcionará completamente
-- - Poderá reativar as consultas reais do Supabase
-- - Dados de exemplo estarão disponíveis para teste 