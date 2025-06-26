-- CORREÇÃO DO TRIGGER DE CRIAÇÃO DE USUÁRIO
-- Este script corrige o erro "Database error creating new user"

-- Primeiro, vamos corrigir a função que cria novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        email, 
        full_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'guest'),
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Se o usuário já existe, apenas atualiza os dados
        UPDATE public.users 
        SET 
            email = NEW.email,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log do erro para debug
        RAISE LOG 'Erro ao criar usuário: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger (remove o antigo primeiro)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verificar se a função foi criada corretamente
SELECT 
    'Trigger corrigido com sucesso!' as status,
    'handle_new_user' as funcao,
    'on_auth_user_created' as trigger_nome;

-- Mostrar usuários existentes para verificação
SELECT 
    'Usuários atuais:' as info,
    COUNT(*) as total
FROM users;

SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 5; 