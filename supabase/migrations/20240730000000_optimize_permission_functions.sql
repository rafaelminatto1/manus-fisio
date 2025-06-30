-- ============================================================================
-- MIGRATION: Otimização das Funções de Verificação de Permissão
-- Data: 2024-07-30
-- Descrição: Reescreve as funções has_project_permission e 
--            has_notebook_permission para usar uma única query com JOIN,
--            eliminando o problema de N+1 queries em políticas RLS.
-- ============================================================================

-- 1. Otimizar a função has_project_permission
CREATE OR REPLACE FUNCTION public.has_project_permission(
  p_project_id uuid,
  p_user_id uuid,
  p_required_permission text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE sql
STABLE -- Mark function as STABLE as it doesn't modify the database
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects p
    LEFT JOIN public.project_collaborators pc ON p.id = pc.project_id AND pc.user_id = p_user_id
    WHERE p.id = p_project_id
    AND (
      -- Condição 1: O usuário é o criador do projeto
      p.created_by = p_user_id
      -- Condição 2: O usuário é um colaborador com permissão suficiente
      OR (
        pc.permission = 'admin' OR
        (pc.permission = 'write' AND p_required_permission IN ('read', 'write')) OR
        (pc.permission = 'read' AND p_required_permission = 'read')
      )
    )
  );
$$;

-- 2. Otimizar a função has_notebook_permission
CREATE OR REPLACE FUNCTION public.has_notebook_permission(
  p_notebook_id uuid,
  p_user_id uuid,
  p_required_permission text DEFAULT 'read'
)
RETURNS boolean
LANGUAGE sql
STABLE -- Mark function as STABLE as it doesn't modify the database
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.notebooks n
    LEFT JOIN public.notebook_collaborators nc ON n.id = nc.notebook_id AND nc.user_id = p_user_id
    WHERE n.id = p_notebook_id
    AND (
      -- Condição 1: O notebook é público e a permissão é de leitura
      (n.is_public AND p_required_permission = 'read')
      -- Condição 2: O usuário é o criador do notebook
      OR n.created_by = p_user_id
      -- Condição 3: O usuário é um colaborador com permissão suficiente
      OR (
        nc.permission = 'admin' OR
        (nc.permission = 'write' AND p_required_permission IN ('read', 'write')) OR
        (nc.permission = 'read' AND p_required_permission = 'read')
      )
    )
  );
$$; 