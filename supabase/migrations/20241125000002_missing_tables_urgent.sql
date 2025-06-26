-- ============================================================================
-- MIGRACAO URGENTE: Criar Tabelas Faltantes
-- Data: 2024-11-25
-- ============================================================================

-- 1. Tabela calendar_events (Sistema de Calendário)
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

-- 2. Tabela notifications (Sistema de Notificações)
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

-- 3. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_attendees ON public.calendar_events USING GIN(attendees);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 4. Índices para Foreign Keys não indexadas (correção de performance)
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_notebook_collaborators_user_id ON public.notebook_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON public.pages(created_by);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON public.project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- 5. RLS para calendar_events
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

CREATE POLICY "Users can delete events they created" ON public.calendar_events
  FOR DELETE USING (created_by = (SELECT auth.uid()));

-- 6. RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- 7. Triggers para updated_at
CREATE TRIGGER calendar_events_updated_at 
  BEFORE UPDATE ON public.calendar_events 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Função para criar notificações
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

-- 9. Dados de exemplo para calendar_events
INSERT INTO public.calendar_events (title, description, start_time, end_time, event_type, location, created_by)
SELECT 
  'Supervisão Clínica',
  'Supervisão semanal de estágio',
  now() + interval '1 day',
  now() + interval '1 day' + interval '2 hours',
  'supervision',
  'Sala de Supervisão',
  id
FROM public.users 
WHERE role = 'mentor'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.calendar_events (title, description, start_time, end_time, event_type, location, created_by)
SELECT 
  'Atendimento Paciente',
  'Sessão de fisioterapia',
  now() + interval '2 days',
  now() + interval '2 days' + interval '1 hour',
  'appointment',
  'Clínica Principal',
  id
FROM public.users 
WHERE role IN ('mentor', 'intern')
LIMIT 1
ON CONFLICT DO NOTHING;

-- 10. Dados de exemplo para notifications
INSERT INTO public.notifications (user_id, title, message, type)
SELECT 
  id,
  'Bem-vindo ao Sistema Manus Fisio!',
  'Seu perfil foi criado com sucesso. Complete suas informações no menu de configurações.',
  'info'
FROM public.users
ON CONFLICT DO NOTHING; 