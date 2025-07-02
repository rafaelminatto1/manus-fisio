-- ============================================================================
-- 🔥 APLICAR AGORA - CORREÇÕES CRÍTICAS SISTEMA MANUS FISIO
-- Data: 2025-01-31
-- Status: PRONTO PARA APLICAÇÃO
-- ============================================================================

-- 🛡️ PARTE 1: CORREÇÕES DE SEGURANÇA CRÍTICAS

-- 1.1. Corrigir RLS na tabela notification_settings (CRÍTICO)
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification settings" ON public.notification_settings
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- 1.2. Corrigir função handle_new_user (search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    department,
    position,
    profile_image_url,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'intern',
    'Fisioterapia',
    'Estagiário',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  
  -- Criar configurações de notificação padrão
  INSERT INTO public.notification_settings (user_id) VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    UPDATE public.users 
    SET 
      email = NEW.email,
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
      profile_image_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', profile_image_url),
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

-- 🗄️ PARTE 2: CRIAR TABELAS FALTANTES

-- 2.1. Tabela calendar_events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
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

-- 2.2. Tabela notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- ⚡ PARTE 3: OTIMIZAÇÕES DE PERFORMANCE

-- 3.1. Índices críticos para Foreign Keys
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 3.2. Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_attendees ON public.calendar_events USING GIN(attendees);

-- 🔒 PARTE 4: POLÍTICAS RLS PARA NOVAS TABELAS

-- 4.1. RLS para calendar_events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events they created or are attending" ON public.calendar_events
  FOR SELECT USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT auth.uid()) = ANY(attendees)
  );

CREATE POLICY "Users can create events" ON public.calendar_events
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update events they created" ON public.calendar_events
  FOR UPDATE USING (created_by = (SELECT auth.uid()));

-- 4.2. RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- 🔄 PARTE 5: TRIGGERS E FUNÇÕES UTILITÁRIAS

-- 5.1. Trigger para updated_at
CREATE TRIGGER calendar_events_updated_at 
  BEFORE UPDATE ON public.calendar_events 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.2. Função para criar notificações
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_action_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- 🧪 PARTE 6: DADOS DE EXEMPLO PARA TESTES

-- 6.1. Evento de exemplo
INSERT INTO public.calendar_events (title, description, start_time, end_time, event_type, location, created_by)
SELECT 
  'Supervisão Clínica - Teste',
  'Evento de teste criado automaticamente',
  now() + interval '1 day',
  now() + interval '1 day' + interval '2 hours',
  'supervision',
  'Sala de Supervisão',
  id
FROM public.users 
WHERE role IN ('admin', 'mentor')
LIMIT 1
ON CONFLICT DO NOTHING;

-- 6.2. Notificação de exemplo
INSERT INTO public.notifications (user_id, title, message, type)
SELECT 
  id,
  '🎉 Sistema Atualizado!',
  'As correções de segurança e performance foram aplicadas com sucesso.',
  'success'
FROM public.users
LIMIT 3
ON CONFLICT DO NOTHING;

-- ✅ VERIFICAÇÃO FINAL
SELECT 
  'calendar_events' as tabela,
  count(*) as registros
FROM public.calendar_events
UNION ALL
SELECT 
  'notifications' as tabela,
  count(*) as registros  
FROM public.notifications; 