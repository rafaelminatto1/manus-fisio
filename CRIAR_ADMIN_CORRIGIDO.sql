-- CRIAR USUÁRIO ADMINISTRADOR - RAFAEL MINATTO (VERSÃO CORRIGIDA)
-- Este script funciona com o trigger corrigido

-- Método 1: Inserir diretamente na tabela users (se o auth.users já existe)
INSERT INTO public.users (
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
    gen_random_uuid(), -- Gera um UUID temporário
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

-- Método 2: Atualizar usuário existente para admin (se já foi criado via auth)
UPDATE public.users 
SET 
    role = 'admin',
    full_name = 'Rafael Minatto',
    crefito = 'CREFITO-3/ADMIN-001',
    specialty = 'Administração do Sistema',
    updated_at = NOW()
WHERE email = 'rafael.minatto@yahoo.com.br';

-- Verificar se o usuário foi criado/atualizado
SELECT 
    'Usuário admin configurado!' as status,
    id,
    email,
    full_name,
    role,
    crefito,
    specialty,
    created_at
FROM users 
WHERE email = 'rafael.minatto@yahoo.com.br';

-- Mostrar todos os administradores
SELECT 
    'Administradores do sistema:' as info,
    COUNT(*) as total
FROM users 
WHERE role = 'admin';

SELECT 
    email,
    full_name,
    role,
    crefito,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at; 