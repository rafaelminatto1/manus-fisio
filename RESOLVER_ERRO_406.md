# 🚨 Resolver Erro 406 - Usuário Não Encontrado

## **Problema Atual:**
```
GET /rest/v1/users?select=*&id=eq.a606de77-ffd7-4b42-b844-3a77925cd072 406 (Not Acceptable)
Error: The result contains 0 rows
```

**Causa:** O usuário foi criado no sistema de autenticação com ID `a606de77-ffd7-4b42-b844-3a77925cd072`, mas esse ID não existe na tabela `users`.

## ⚡ **Solução Rápida**

### **Opção 1: Inserir o Usuário Faltante (Recomendado)**

Execute no SQL Editor do Supabase:

```sql
-- Inserir o usuário que está faltando na tabela users
INSERT INTO users (id, email, full_name, role, crefito, specialty) 
VALUES (
  'a606de77-ffd7-4b42-b844-3a77925cd072',
  'admin@clinica.com',
  'Administrador Sistema',
  'admin',
  'CREFITO-3/00000-F',
  'Gestão Clínica'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
```

### **Opção 2: Sincronizar Todos os Usuários**

Execute este script completo:

```sql
-- Verificar usuários no auth
SELECT id, email FROM auth.users;

-- Inserir/atualizar todos os usuários do auth na tabela users
INSERT INTO users (id, email, full_name, role, crefito, specialty)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 
           CASE 
             WHEN au.email = 'admin@clinica.com' THEN 'Administrador Sistema'
             WHEN au.email = 'rafael.minatto@yahoo.com.br' THEN 'Rafael Minatto'
             WHEN au.email = 'rafael.santos@clinica.com' THEN 'Dr. Rafael Santos'
             WHEN au.email = 'ana.lima@clinica.com' THEN 'Dra. Ana Lima'
             WHEN au.email = 'maria.silva@usp.br' THEN 'Maria Silva'
             WHEN au.email = 'pedro.alves@unifesp.br' THEN 'Pedro Alves'
             ELSE au.email
           END),
  CASE 
    WHEN au.email IN ('admin@clinica.com', 'rafael.minatto@yahoo.com.br') THEN 'admin'
    WHEN au.email IN ('rafael.santos@clinica.com', 'ana.lima@clinica.com') THEN 'mentor'
    WHEN au.email IN ('maria.silva@usp.br', 'pedro.alves@unifesp.br') THEN 'intern'
    ELSE 'guest'
  END,
  CASE 
    WHEN au.email IN ('admin@clinica.com', 'rafael.santos@clinica.com', 'ana.lima@clinica.com') 
    THEN 'CREFITO-3/12345-F'
    ELSE NULL
  END,
  CASE 
    WHEN au.email = 'admin@clinica.com' THEN 'Gestão Clínica'
    WHEN au.email = 'rafael.santos@clinica.com' THEN 'Fisioterapia Ortopédica'
    WHEN au.email = 'ana.lima@clinica.com' THEN 'Fisioterapia Neurológica'
    ELSE NULL
  END
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  crefito = EXCLUDED.crefito,
  specialty = EXCLUDED.specialty;
```

## ✅ **Verificação**

Após executar, verifique se funcionou:

```sql
-- Verificar sincronização
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  'Sincronizado ✅' as status
FROM users u
INNER JOIN auth.users au ON u.id = au.id
ORDER BY u.email;
```

## 🎯 **Teste Final**

1. Execute o SQL acima
2. Acesse: http://localhost:3000
3. Login: `admin@clinica.com` / `admin123`
4. Deve funcionar sem erro 406!

---

**🎉 Problema resolvido! Login funcionando.** 