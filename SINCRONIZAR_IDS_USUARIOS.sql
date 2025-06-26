-- SINCRONIZAR IDS ENTRE AUTH.USERS E PUBLIC.USERS
-- Execute este SQL no SQL Editor do Supabase após criar os usuários no Authentication

-- Primeiro, vamos verificar os usuários criados no sistema de autenticação
-- SELECT id, email FROM auth.users;

-- Agora vamos atualizar a tabela users para usar os mesmos IDs do auth.users
-- IMPORTANTE: Execute linha por linha, substituindo os IDs reais

-- 1. Atualizar admin@clinica.com
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'admin@clinica.com')
WHERE email = 'admin@clinica.com';

-- 2. Atualizar rafael.minatto@yahoo.com.br (se existir na tabela users)
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'rafael.minatto@yahoo.com.br')
WHERE email = 'rafael.minatto@yahoo.com.br';

-- 3. Atualizar rafael.santos@clinica.com
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'rafael.santos@clinica.com')
WHERE email = 'rafael.santos@clinica.com';

-- 4. Atualizar ana.lima@clinica.com
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'ana.lima@clinica.com')
WHERE email = 'ana.lima@clinica.com';

-- 5. Atualizar maria.silva@usp.br
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'maria.silva@usp.br')
WHERE email = 'maria.silva@usp.br';

-- 6. Atualizar pedro.alves@unifesp.br
UPDATE users 
SET id = (SELECT id FROM auth.users WHERE email = 'pedro.alves@unifesp.br')
WHERE email = 'pedro.alves@unifesp.br';

-- Verificar se a sincronização funcionou
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.role,
  CASE 
    WHEN au.id IS NOT NULL THEN 'Sincronizado ✅'
    ELSE 'Não sincronizado ❌'
  END as status
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.email;

-- Se algum usuário não sincronizou, você pode inserir manualmente:
-- INSERT INTO users (id, email, full_name, role, crefito, specialty)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', email),
--   'admin',
--   NULL,
--   NULL
-- FROM auth.users 
-- WHERE email NOT IN (SELECT email FROM users); 