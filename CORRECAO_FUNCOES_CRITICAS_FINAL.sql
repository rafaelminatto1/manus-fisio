-- =====================================================
-- 🛡️ CORREÇÃO FINAL DAS FUNÇÕES CRÍTICAS
-- =====================================================
-- Este script garante que TODAS as funções críticas estejam seguras
-- (SECURITY DEFINER + search_path = public, pg_temp)
-- =====================================================

-- Função 1: log_activity
DROP FUNCTION IF EXISTS public.log_activity(UUID, TEXT, TEXT, UUID, JSONB);
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO activity_id;
  RETURN activity_id;
END;
$$;

-- Função 2: is_admin
DROP FUNCTION IF EXISTS public.is_admin(UUID);
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  check_user_id UUID;
  user_role TEXT;
BEGIN
  check_user_id := COALESCE(user_id, auth.uid());
  IF check_user_id IS NULL THEN RETURN FALSE; END IF;
  SELECT role INTO user_role FROM public.users WHERE id = check_user_id;
  RETURN user_role = 'admin';
END;
$$;

-- Função 3: is_mentor
DROP FUNCTION IF EXISTS public.is_mentor(UUID);
CREATE OR REPLACE FUNCTION public.is_mentor(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  check_user_id UUID;
  user_role TEXT;
BEGIN
  check_user_id := COALESCE(user_id, auth.uid());
  IF check_user_id IS NULL THEN RETURN FALSE; END IF;
  SELECT role INTO user_role FROM public.users WHERE id = check_user_id;
  RETURN user_role IN ('admin', 'mentor');
END;
$$;

-- Função 4: has_notebook_permission
DROP FUNCTION IF EXISTS public.has_notebook_permission(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION public.has_notebook_permission(
  notebook_id UUID,
  user_id UUID DEFAULT NULL,
  required_permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  check_user_id UUID;
  notebook_owner UUID;
  user_role TEXT;
BEGIN
  check_user_id := COALESCE(user_id, auth.uid());
  IF check_user_id IS NULL THEN RETURN FALSE; END IF;
  SELECT role INTO user_role FROM public.users WHERE id = check_user_id;
  IF user_role = 'admin' THEN RETURN TRUE; END IF;
  SELECT created_by INTO notebook_owner FROM public.notebooks WHERE id = notebook_id;
  IF notebook_owner = check_user_id THEN RETURN TRUE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.notebook_collaborators 
    WHERE notebook_id = has_notebook_permission.notebook_id AND user_id = check_user_id
  );
END;
$$;

-- Função 5: has_project_permission
DROP FUNCTION IF EXISTS public.has_project_permission(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION public.has_project_permission(
  project_id UUID,
  user_id UUID DEFAULT NULL,
  required_permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  check_user_id UUID;
  project_owner UUID;
  user_role TEXT;
BEGIN
  check_user_id := COALESCE(user_id, auth.uid());
  IF check_user_id IS NULL THEN RETURN FALSE; END IF;
  SELECT role INTO user_role FROM public.users WHERE id = check_user_id;
  IF user_role = 'admin' THEN RETURN TRUE; END IF;
  SELECT created_by INTO project_owner FROM public.projects WHERE id = project_id;
  IF project_owner = check_user_id THEN RETURN TRUE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.project_collaborators 
    WHERE project_id = has_project_permission.project_id AND user_id = check_user_id
  );
END;
$$;

-- Função 6: update_updated_at_column
-- (Já corrigida pelo script de triggers, não precisa repetir)

-- =====================================================
-- ✅ Após executar, rode:
-- SELECT * FROM public.verify_100_percent_success();
-- para confirmar 100% das funções críticas seguras!
-- ===================================================== 