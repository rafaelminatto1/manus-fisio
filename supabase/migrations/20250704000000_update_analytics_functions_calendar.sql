-- ============================================================================
-- MIGRATION: Ajustar Funções de Analytics para usar calendar_events
-- Data: 2025-07-04
-- Descrição: Adiciona coluna status em calendar_events e atualiza funções de
--            analytics para referenciar eventos do tipo 'appointment'.
-- ============================================================================

-- 1. Adicionar coluna status (se ainda não existir) com possíveis valores
--    'scheduled', 'completed', 'cancelled', 'no_show'.
ALTER TABLE public.calendar_events
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show'));

-- 2. Função para contar o total de agendamentos (appointments) no mês atual
CREATE OR REPLACE FUNCTION get_appointments_this_month()
RETURNS INT
LANGUAGE sql
AS $$
  SELECT COUNT(*)::INT
  FROM public.calendar_events
  WHERE event_type = 'appointment'
    AND date_trunc('month', start_time) = date_trunc('month', now());
$$;

-- 3. Função para obter a distribuição de status dos agendamentos
CREATE OR REPLACE FUNCTION get_appointment_status_distribution()
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
AS $$
  SELECT 
    status,
    COUNT(*) AS count
  FROM public.calendar_events
  WHERE event_type = 'appointment'
  GROUP BY status;
$$; 