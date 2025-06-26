# 🔐 Solução para Erro 400 (Bad Request) no Login

## 🚨 **Problema Identificado**
```
POST https://hycudcwtuocmufhpsnmr.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
Error fetching user profile: {code: 'PGRST116', details: 'The result contains 0 rows'}
```

**Causa:** Os usuários existem na tabela `users` do banco de dados, mas **NÃO existem no sistema de autenticação** do Supabase.

## ✅ **Solução Completa**

### **Passo 1: Acesse o Supabase Dashboard**
1. Vá para: https://supabase.com/dashboard/project/hycudcwtuocmufhpsnmr
2. Faça login na sua conta Supabase
3. Selecione o projeto: `hycudcwtuocmufhpsnmr`

### **Passo 2: Criar Usuários no Authentication**
1. No menu lateral: `Authentication` → `Users`
2. Clique em `Add User` para cada usuário:

#### **👨‍💼 Admin Principal**
```
Email: admin@clinica.com
Password: admin123
Email Confirm: ✅
Auto Confirm User: ✅
```

#### **👨‍⚕️ Rafael Minatto**
```
Email: rafael.minatto@yahoo.com.br
Password: Yukari30@
Email Confirm: ✅
Auto Confirm User: ✅
```

#### **👨‍⚕️ Dr. Rafael Santos**
```
Email: rafael.santos@clinica.com
Password: mentor123
Email Confirm: ✅
Auto Confirm User: ✅
```

#### **👩‍⚕️ Dra. Ana Lima**
```
Email: ana.lima@clinica.com
Password: mentor123
Email Confirm: ✅
Auto Confirm User: ✅
```

#### **👩‍🎓 Maria Silva**
```
Email: maria.silva@usp.br
Password: intern123
Email Confirm: ✅
Auto Confirm User: ✅
```

#### **👨‍🎓 Pedro Alves**
```
Email: pedro.alves@unifesp.br
Password: intern123
Email Confirm: ✅
Auto Confirm User: ✅
```

### **Passo 3: Verificar Criação**
Após criar todos os usuários:
1. Vá em `Authentication` → `Users`
2. Confirme que todos os 6 usuários aparecem na lista
3. Status deve estar `Confirmed`

### **Passo 4: Sincronizar IDs dos Usuários**
Após criar os usuários no Authentication, execute o script:

1. Vá para: `SQL Editor` no Supabase Dashboard
2. Execute o arquivo: `SINCRONIZAR_IDS_USUARIOS.sql`
3. Isso sincronizará os IDs entre `auth.users` e `public.users`

### **Passo 5: Testar Login**
1. Acesse: http://localhost:3000
2. Teste login com qualquer usuário:
   - **Email:** `admin@clinica.com`
   - **Senha:** `admin123`
3. Deve funcionar sem erros!

## 🔧 **Alternativa: Criar via SQL (Avançado)**

Se preferir criar via SQL, execute no SQL Editor:

```sql
-- Criar usuários no sistema de autenticação
-- NOTA: Isso requer privilégios especiais
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_sent_at,
  email_change,
  email_change_token_current,
  email_change_token_new,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@clinica.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  '',
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  0,
  NULL,
  '',
  NULL
);
```

## 🎯 **Resultado Esperado**

Após seguir os passos:
- ✅ **Erro 400** resolvido
- ✅ **Login funcionando** para todos os usuários
- ✅ **Sistema 100% operacional**
- ✅ **Acesso ao dashboard** liberado

## 📋 **Usuários Criados**

| Email | Senha | Role |
|-------|--------|------|
| admin@clinica.com | admin123 | admin |
| rafael.minatto@yahoo.com.br | Yukari30@ | admin |
| rafael.santos@clinica.com | mentor123 | mentor |
| ana.lima@clinica.com | mentor123 | mentor |
| maria.silva@usp.br | intern123 | intern |
| pedro.alves@unifesp.br | intern123 | intern |

## 🚀 **Teste Final**
1. Acesse: http://localhost:3000
2. Login: `admin@clinica.com` / `admin123`
3. Deve acessar o dashboard sem erros!

---

**🎉 Problema resolvido! Sistema pronto para uso.** 

## 🎯 **NOVO PROBLEMA IDENTIFICADO E SOLUÇÃO CRIADA!**

### **🔍 Análise do Erro 406:**
O login está funcionando (não há mais erro 400), mas agora temos:
- ✅ **Usuário autenticado** no sistema de autenticação
- ❌ **Usuário não encontrado** na tabela `users` com o ID específico
- **ID do usuário:** `a606de77-ffd7-4b42-b844-3a77925cd072`

### **📋 Solução Criada:**
Criei dois arquivos para resolver:

1. **`RESOLVER_ERRO_406.md`** - Solução rápida e direta
2. **`SINCRONIZAR_IDS_USUARIOS.sql`** - Script completo de sincronização

### **⚡ Ação Imediata:**

**Execute no SQL Editor do Supabase:**

```sql
-- Solução rápida: Inserir o usuário faltante
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

### **🎯 Resultado Esperado:**
- ✅ Erro 406 resolvido
- ✅ Login completo funcionando
- ✅ Acesso ao dashboard liberado
- ✅ Sistema 100% operacional

### **📄 Documentação:**
- **Guia rápido:** `RESOLVER_ERRO_406.md`
- **Script completo:** `SINCRONIZAR_IDS_USUARIOS.sql`

**O problema está quase resolvido! Só falta sincronizar esse usuário específico na tabela `users`.** 