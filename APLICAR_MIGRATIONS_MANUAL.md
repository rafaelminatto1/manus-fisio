# 🗄️ Aplicar Migrations no Supabase - Guia Manual

## ✅ **Status: .env.local Configurado!**

O arquivo `.env.local` foi **automaticamente configurado** com suas credenciais:
- ✅ URL: `https://hycudcwtuocmufahpsnmr.supabase.co`
- ✅ Chave anon configurada
- ✅ Chave service_role configurada
- ✅ MOCK_AUTH desabilitado

## 📋 **Próximo Passo: Aplicar Schema no Dashboard**

### **1. Acesse o SQL Editor**
🔗 **Link direto:** `https://hycudcwtuocmufahpsnmr.supabase.co/project/hycudcwtuocmufahpsnmr/sql`

### **2. Execute as 3 Migrations (uma por vez)**

#### **Migration 1: Schema Principal**
Copie e execute o conteúdo de: `supabase/migrations/20240125000000_initial_schema.sql`

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'intern', 'guest');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE mentorship_status AS ENUM ('active', 'completed', 'suspended');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'guest',
    crefito TEXT,
    specialty TEXT,
    university TEXT,
    semester INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continue com o resto do arquivo...
```

#### **Migration 2: Políticas RLS**
Copie e execute: `supabase/migrations/20240125000001_rls_policies.sql`

#### **Migration 3: Dados de Exemplo**
Copie e execute: `supabase/migrations/20240125000002_sample_data.sql`

## 🚀 **Testar Sistema**

Após aplicar as migrations:

```bash
npm run dev
```

### **✅ O que deve funcionar:**

1. **Acesse:** http://localhost:3000
2. **Login:** Não aparece mais aviso "Mock Data"
3. **Dashboard:** Mostra estatísticas reais
4. **Navegação:** Todas as 5 páginas funcionam
5. **Dados:** Persistem no banco Supabase

## 🔍 **Verificação de Sucesso**

### **No Dashboard do Supabase:**
- Vá em **Table Editor**
- Deve ver 9 tabelas criadas:
  - `users`
  - `notebooks`
  - `pages`
  - `projects`
  - `tasks`
  - `mentorships`
  - `comments`
  - `activity_logs`
  - `notebook_collaborators`
  - `project_collaborators`

### **No Sistema Manus Fisio:**
- ✅ Login funciona
- ✅ Dashboard carrega dados
- ✅ Não há avisos de mock
- ✅ Dados salvam no banco

## 🎯 **Resultado Final**

**Quando tudo estiver configurado:**
- 🎉 Sistema Manus Fisio 100% operacional
- 🗄️ Banco de dados completo no Supabase
- 🔐 Autenticação real funcionando
- 📊 Dashboard com estatísticas reais
- 💾 Dados persistindo corretamente

---

## 🆘 **Se houver problemas:**

1. **Erro de conexão:** Verifique se as credenciais estão corretas no .env.local
2. **Erro de SQL:** Execute as migrations uma por vez no SQL Editor
3. **Erro de login:** Verifique se RLS policies foram aplicadas
4. **Dados não aparecem:** Verifique se sample_data foi executado

**🔗 Links Úteis:**
- Dashboard: https://hycudcwtuocmufahpsnmr.supabase.co
- SQL Editor: https://hycudcwtuocmufahpsnmr.supabase.co/project/hycudcwtuocmufahpsnmr/sql
- Table Editor: https://hycudcwtuocmufahpsnmr.supabase.co/project/hycudcwtuocmufahpsnmr/editor 