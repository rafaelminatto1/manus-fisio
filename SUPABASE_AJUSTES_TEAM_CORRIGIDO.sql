-- 🔧 SCRIPT CORRIGIDO - AJUSTES NECESSÁRIOS NO SUPABASE PARA PÁGINA DE EQUIPE
-- Execute este script no SQL Editor do Supabase Dashboard

-- ✅ 1. ADICIONAR COLUNA is_active NA TABELA USERS
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ✅ 2. AJUSTAR NOMES DAS COLUNAS NA TABELA MENTORSHIPS
ALTER TABLE mentorships 
ADD COLUMN IF NOT EXISTS hours_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hours_required INTEGER DEFAULT 300;

-- ✅ 3. COPIAR DADOS DAS COLUNAS ANTIGAS
UPDATE mentorships 
SET 
  hours_completed = COALESCE(completed_hours, 0),
  hours_required = COALESCE(required_hours, 300);

-- ✅ 4. ADICIONAR COLUNA GOALS
ALTER TABLE mentorships 
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;

-- ✅ 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ✅ 6. ATUALIZAR USUÁRIOS EXISTENTES
UPDATE users SET is_active = true;

-- ✅ 7. DADOS DE EXEMPLO CORRIGIDOS (com UUID gerado automaticamente)
INSERT INTO users (id, email, full_name, role, crefito, specialty, is_active)
VALUES 
  (gen_random_uuid(), 'mentor@clinica.com', 'Dr. João Silva', 'mentor', 'CREFITO-3/12345-F', 'Fisioterapia Ortopédica', true),
  (gen_random_uuid(), 'mentor2@clinica.com', 'Dra. Maria Santos', 'mentor', 'CREFITO-3/67890-F', 'Fisioterapia Neurológica', true),
  (gen_random_uuid(), 'estagiario1@usp.br', 'Ana Costa', 'intern', NULL, NULL, 'USP - Universidade de São Paulo', 8, true),
  (gen_random_uuid(), 'estagiario2@unifesp.br', 'Pedro Oliveira', 'intern', NULL, NULL, 'UNIFESP', 7, true)
ON CONFLICT (email) DO NOTHING;

-- ✅ 8. CRIAR MENTORIA DE EXEMPLO
DO $$
DECLARE
  mentor_id UUID;
  intern_id UUID;
BEGIN
  -- Buscar IDs de mentor e estagiário
  SELECT id INTO mentor_id FROM users WHERE role = 'mentor' AND email = 'mentor@clinica.com';
  SELECT id INTO intern_id FROM users WHERE role = 'intern' AND email = 'estagiario1@usp.br';
  
  -- Inserir mentoria se ambos existirem
  IF mentor_id IS NOT NULL AND intern_id IS NOT NULL THEN
    INSERT INTO mentorships (
      id,
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
      gen_random_uuid(),
      mentor_id,
      intern_id,
      'active',
      CURRENT_DATE - INTERVAL '30 days',
      120,
      400,
      '["Dominar técnicas de avaliação ortopédica", "Desenvolver habilidades de tratamento manual", "Aprender protocolos de reabilitação"]'::jsonb,
      'Mentoria iniciada com foco em fisioterapia ortopédica'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ✅ 9. VERIFICAR RESULTADOS
SELECT 'Usuários por role:' as tipo, role, COUNT(*) as total
FROM users 
WHERE is_active = true
GROUP BY role
UNION ALL
SELECT 'Mentorias por status:' as tipo, status::text, COUNT(*) as total
FROM mentorships 
GROUP BY status
ORDER BY tipo, total DESC;

-- ✅ 10. MOSTRAR DADOS CRIADOS
SELECT 
  u.full_name,
  u.role,
  u.email,
  CASE 
    WHEN u.role = 'mentor' THEN u.specialty
    WHEN u.role = 'intern' THEN u.university
    ELSE 'N/A'
  END as info_adicional
FROM users u
WHERE u.is_active = true
ORDER BY u.role, u.full_name; 