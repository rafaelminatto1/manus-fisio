-- Migração: Sistema de Notificações Completo
-- Data: 2024-11-25
-- Descrição: Criar tabela notification_settings e atualizar notifications

-- Criar tabela notification_settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  calendar_reminders BOOLEAN DEFAULT true,
  project_updates BOOLEAN DEFAULT true,
  team_mentions BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  reminder_time INTEGER DEFAULT 15, -- minutos antes do evento
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Atualizar tabela notifications para incluir campos faltantes
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Atualizar tipo de notificação para incluir 'event' e 'system'
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text, 'event'::text, 'system'::text]));

-- Renomear coluna is_read para read se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE notifications RENAME COLUMN is_read TO read;
    END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Habilitar RLS na tabela notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notification_settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings"
  ON notification_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em notification_settings
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();

-- Trigger para atualizar updated_at em notifications
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Criar algumas notificações de exemplo para demonstração
INSERT INTO notifications (user_id, title, message, type, action_url, metadata) 
SELECT 
  u.id,
  'Bem-vindo ao Sistema de Notificações! 🎉',
  'O sistema de notificações inteligentes foi ativado. Configure suas preferências nas configurações.',
  'success',
  '/settings',
  '{"feature": "notifications", "version": "1.0"}'
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = u.id AND n.title LIKE 'Bem-vindo ao Sistema de Notificações%'
);

-- Função para criar notificações automáticas de eventos de calendário
CREATE OR REPLACE FUNCTION create_calendar_event_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar criador do evento
  INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
  VALUES (
    NEW.created_by,
    'Evento criado: ' || NEW.title,
    'Seu evento "' || NEW.title || '" foi agendado para ' || 
    to_char(NEW.start_time, 'DD/MM/YYYY "às" HH24:MI'),
    'event',
    '/calendar',
    jsonb_build_object(
      'event_id', NEW.id,
      'event_type', NEW.event_type,
      'start_time', NEW.start_time
    )
  );

  -- Notificar participantes (se houver)
  IF NEW.attendees IS NOT NULL AND array_length(NEW.attendees, 1) > 0 THEN
    INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
    SELECT 
      unnest(NEW.attendees),
      'Você foi convidado: ' || NEW.title,
      'Você foi convidado para o evento "' || NEW.title || '" em ' || 
      to_char(NEW.start_time, 'DD/MM/YYYY "às" HH24:MI'),
      'event',
      '/calendar',
      jsonb_build_object(
        'event_id', NEW.id,
        'event_type', NEW.event_type,
        'start_time', NEW.start_time,
        'invited_by', NEW.created_by
      )
    WHERE unnest(NEW.attendees) != NEW.created_by; -- Não notificar o criador novamente
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificações automáticas de eventos
DROP TRIGGER IF EXISTS calendar_event_notification_trigger ON calendar_events;
CREATE TRIGGER calendar_event_notification_trigger
  AFTER INSERT ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION create_calendar_event_notification();

-- Função para criar notificações de lembrete de eventos
CREATE OR REPLACE FUNCTION create_event_reminders()
RETURNS void AS $$
DECLARE
  event_record RECORD;
  user_settings RECORD;
  reminder_time TIMESTAMPTZ;
BEGIN
  -- Buscar eventos que precisam de lembrete
  FOR event_record IN 
    SELECT ce.*, u.id as user_id
    FROM calendar_events ce
    CROSS JOIN users u
    WHERE ce.start_time > now() 
    AND ce.start_time <= now() + INTERVAL '2 hours'
    AND (u.id = ce.created_by OR u.id = ANY(ce.attendees))
  LOOP
    -- Buscar configurações do usuário
    SELECT * INTO user_settings 
    FROM notification_settings 
    WHERE user_id = event_record.user_id;
    
    -- Se não tem configurações, usar padrões
    IF user_settings IS NULL THEN
      user_settings.calendar_reminders := true;
      user_settings.reminder_time := 15;
    END IF;
    
    -- Verificar se deve criar lembrete
    IF user_settings.calendar_reminders THEN
      reminder_time := event_record.start_time - (user_settings.reminder_time || ' minutes')::INTERVAL;
      
      -- Criar lembrete se ainda não existe e está na hora
      IF now() >= reminder_time AND NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = event_record.user_id 
        AND metadata->>'event_id' = event_record.id::text
        AND type = 'event'
        AND title LIKE 'Lembrete:%'
      ) THEN
        INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
        VALUES (
          event_record.user_id,
          'Lembrete: ' || event_record.title,
          'Seu evento "' || event_record.title || '" começa em ' || 
          user_settings.reminder_time || ' minutos.',
          'event',
          '/calendar',
          jsonb_build_object(
            'event_id', event_record.id,
            'event_type', event_record.event_type,
            'start_time', event_record.start_time,
            'reminder', true
          )
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentário para lembrar de configurar cron job (se disponível)
-- Para executar lembretes automaticamente, adicione no cron:
-- SELECT cron.schedule('event-reminders', '*/5 * * * *', 'SELECT create_event_reminders();'); 