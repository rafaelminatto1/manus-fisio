-- ============================================================================
-- MIGRACAO URGENTE: Correções de Segurança e Performance
-- Data: 2024-11-25
-- ============================================================================

-- 1. CORREÇÃO DE SEGURANÇA: search_path nas funções
-- Ref: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- 1.1. Corrigir função update_updated_at_column
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

-- 1.2. Corrigir função log_activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

-- 1.3. Corrigir função has_notebook_permission
CREATE OR REPLACE FUNCTION public.has_notebook_permission(
  notebook_id uuid,
  user_id uuid,
  required_permission text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  notebook_record record;
  user_permission text;
BEGIN
  SELECT * INTO notebook_record FROM public.notebooks WHERE id = notebook_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF notebook_record.is_public AND required_permission = 'read' THEN
    RETURN true;
  END IF;
  
  IF notebook_record.created_by = user_id THEN
    RETURN true;
  END IF;
  
  SELECT permission INTO user_permission 
  FROM public.notebook_collaborators 
  WHERE notebook_id = has_notebook_permission.notebook_id 
    AND user_id = has_notebook_permission.user_id;
  
  IF user_permission = 'admin' THEN
    RETURN true;
  ELSIF user_permission = 'write' AND required_permission IN ('read', 'write') THEN
    RETURN true;
  ELSIF user_permission = 'read' AND required_permission = 'read' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 1.4. Corrigir função is_admin
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

-- 1.5. Corrigir função is_mentor
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

-- 1.6. Corrigir função has_project_permission
CREATE OR REPLACE FUNCTION public.has_project_permission(
  project_id uuid,
  user_id uuid,
  required_permission text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  project_record record;
  user_permission text;
BEGIN
  SELECT * INTO project_record FROM public.projects WHERE id = project_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF project_record.created_by = user_id THEN
    RETURN true;
  END IF;
  
  SELECT permission INTO user_permission 
  FROM public.project_collaborators 
  WHERE project_id = has_project_permission.project_id 
    AND user_id = has_project_permission.user_id;
  
  IF user_permission = 'admin' THEN
    RETURN true;
  ELSIF user_permission = 'write' AND required_permission IN ('read', 'write') THEN
    RETURN true;
  ELSIF user_permission = 'read' AND required_permission = 'read' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 1.7. Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'guest'
  );
  RETURN NEW;
END;
$$; 