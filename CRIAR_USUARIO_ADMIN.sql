-- CRIAR USUÁRIO ADMINISTRADOR - RAFAEL MINATTO
-- Este script cria o usuário administrador no sistema Manus Fisio

-- Primeiro, inserir o usuário na tabela auth.users (isso normalmente é feito pelo Supabase Auth)
-- Como não podemos inserir diretamente em auth.users via SQL, vamos criar apenas na tabela users

-- Inserir usuário administrador na tabela users
-- Nota: O ID será gerado automaticamente quando o usuário fizer login pela primeira vez
INSERT INTO users (
    id, 
    email, 
    full_name, 
    role, 
    crefito, 
    specialty, 
    university, 
    semester,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'rafael.minatto@yahoo.com.br',
    'Rafael Minatto',
    'admin',
    'CREFITO-3/ADMIN-001',
    'Administração do Sistema',
    NULL,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    full_name = 'Rafael Minatto',
    crefito = 'CREFITO-3/ADMIN-001',
    specialty = 'Administração do Sistema',
    updated_at = NOW();

-- Verificar se o usuário foi criado
SELECT 
    id,
    email,
    full_name,
    role,
    crefito,
    specialty,
    created_at
FROM users 
WHERE email = 'rafael.minatto@yahoo.com.br';

-- Mostrar todos os usuários admin
SELECT 
    'Usuários Administradores:' as info,
    COUNT(*) as total
FROM users 
WHERE role = 'admin';

SELECT 
    email,
    full_name,
    role,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at; 