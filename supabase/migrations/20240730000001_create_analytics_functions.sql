-- ============================================================================
-- MIGRATION: Funções de Analytics para o Dashboard
-- Data: 2024-07-30
-- Descrição: Cria funções PostgreSQL para agregar dados e alimentar
--            o dashboard de relatórios e analytics.
-- ============================================================================

-- Função para contar o total de pacientes
CREATE OR REPLACE FUNCTION get_total_patients()
RETURNS INT
LANGUAGE sql
AS $$
  SELECT COUNT(*)::INT FROM public.patients;
$$;

-- Função para contar o total de agendamentos no mês atual
CREATE OR REPLACE FUNCTION get_appointments_this_month()
RETURNS INT
LANGUAGE sql
AS $$
  SELECT COUNT(*)::INT 
  FROM public.appointments
  WHERE date_trunc('month', appointment_date) = date_trunc('month', now());
$$;

-- Função para contar novos pacientes no mês atual
CREATE OR REPLACE FUNCTION get_new_patients_this_month()
RETURNS INT
LANGUAGE sql
AS $$
  SELECT COUNT(*)::INT 
  FROM public.patients
  WHERE date_trunc('month', created_at) = date_trunc('month', now());
$$;

-- Função para obter a distribuição de status dos agendamentos
CREATE OR REPLACE FUNCTION get_appointment_status_distribution()
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
AS $$
  SELECT 
    COALESCE(status, 'Não definido') as status, 
    COUNT(*) as count
  FROM public.appointments
  GROUP BY status;
$$; 