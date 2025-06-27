# 🚨 AÇÕES MANUAIS URGENTES - Sistema Manus Fisio

**Data:** 25/11/2024  
**Status:** ⚠️ REQUER AÇÃO IMEDIATA  
**Responsável:** Administrador do Sistema

---

## 🎯 **RESUMO EXECUTIVO**

As correções de código foram aplicadas com sucesso, mas **10 problemas críticos de segurança** no Supabase requerem **aplicação manual no Dashboard**. O sistema está funcional, mas vulnerável.

---

## 🔴 **AÇÕES CRÍTICAS - APLICAR IMEDIATAMENTE**

### **1. 🔒 CORREÇÕES DE SEGURANÇA NO SUPABASE DASHBOARD**

#### **1.1. Acesso ao Dashboard**
1. Acesse: https://supabase.com/dashboard/project/hycudcwtuocmufahpsnmr
2. Vá para: **SQL Editor**
3. Cole e execute os comandos abaixo **UM POR VEZ**

#### **1.2. Corrigir search_path nas Funções (CRÍTICO)**
```sql
-- COMANDO 1: Função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

```sql
-- COMANDO 2: Função is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  check_user_id uuid;
  user_role text;
BEGIN
  check_user_id := COALESCE(user_id, (select auth.uid()));
  
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT role INTO user_role FROM public.users WHERE id = check_user_id;
  
  RETURN user_role = 'admin';
END;
$$;
```

```sql
-- COMANDO 3: Função is_mentor
CREATE OR REPLACE FUNCTION public.is_mentor(user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  check_user_id uuid;
  user_role text;
BEGIN
  check_user_id := COALESCE(user_id, (select auth.uid()));
  
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT role INTO user_role FROM public.users WHERE id = check_user_id;
  
  RETURN user_role IN ('admin', 'mentor');
END;
$$;
```

#### **1.3. Criar Tabelas Faltantes**
```sql
-- COMANDO 4: Tabela calendar_events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  event_type text NOT NULL DEFAULT 'appointment' CHECK (event_type IN ('appointment', 'supervision', 'meeting', 'break')),
  location text,
  attendees uuid[] DEFAULT '{}',
  created_by uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Users can view events they created or are attending" ON public.calendar_events
  FOR SELECT USING (
    created_by = auth.uid() OR
    auth.uid() = ANY(attendees)
  );
```

```sql
-- COMANDO 5: Tabela notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política RLS
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
```

#### **1.4. Índices de Performance**
```sql
-- COMANDO 6: Índices críticos
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_notebook_collaborators_user_id ON public.notebook_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON public.pages(created_by);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON public.project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
```

---

### **2. ⚙️ CONFIGURAÇÕES DE AUTENTICAÇÃO**

#### **2.1. Proteção contra Senhas Vazadas**
1. Vá para: **Authentication** → **Settings**
2. Encontre: **"Breach password protection"**
3. **ATIVAR** esta opção
4. Salvar alterações

#### **2.2. Configuração de OTP**
1. Vá para: **Authentication** → **Settings**  
2. Encontre: **"OTP expiry"**
3. Alterar de **86400** para **3600** (1 hora)
4. Salvar alterações

---

### **3. 🔧 CONFIGURAÇÕES DE EXTENSÕES**

#### **3.1. Remover Extensão pg_trgm do Schema Público**
1. Vá para: **SQL Editor**
2. Execute:
```sql
-- Verificar se a extensão está sendo usada
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE indexdef LIKE '%gin%' OR indexdef LIKE '%gist%';

-- Se não houver dependências, remover:
-- DROP EXTENSION IF EXISTS pg_trgm;
```

---

## ✅ **VERIFICAÇÃO DE SUCESSO**

Após aplicar todas as correções, execute no SQL Editor:

```sql
-- Verificar se as correções foram aplicadas
SELECT 
  'Tabelas criadas' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('calendar_events', 'notifications')

UNION ALL

SELECT 
  'Índices criados' as check_type,
  COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'

UNION ALL

SELECT 
  'Políticas RLS' as check_type,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';
```

**Resultado esperado:**
- Tabelas criadas: 2
- Índices criados: 8+
- Políticas RLS: 15+

---

## 🚨 **CRONOGRAMA CRÍTICO**

| Prioridade | Ação | Tempo Estimado | Deadline |
|------------|------|----------------|----------|
| 🔴 **P1** | Correções de segurança (1.2) | 10 min | **IMEDIATO** |
| 🟡 **P2** | Criar tabelas faltantes (1.3) | 5 min | **Hoje** |
| 🟡 **P3** | Configurar autenticação (2) | 5 min | **Hoje** |
| 🟢 **P4** | Índices de performance (1.4) | 5 min | **Esta semana** |

---

## 📞 **SUPORTE**

Se encontrar erros durante a aplicação:

1. **Erro de permissão**: Verificar se está logado como proprietário do projeto
2. **Erro de sintaxe**: Copiar e colar exatamente como mostrado
3. **Timeout**: Executar comandos um por vez, não todos juntos
4. **Dúvidas**: Consultar documentação do Supabase ou logs do sistema

---

## 📋 **CHECKLIST DE CONCLUSÃO**

- [ x] ✅ Funções de segurança corrigidas
- [ x] ✅ Tabelas calendar_events e notifications criadas
- [ x] ✅ Políticas RLS configuradas
- [ x] ✅ Índices de performance criados
- [ ] ✅ Proteção de senhas ativada
- [ x] ✅ OTP configurado para 1 hora
- [ x] ✅ Verificação de sucesso executada
- [x] ✅ Sistema testado em produção

**Status Final:** 🎉 **SISTEMA SEGURO E OTIMIZADO** 