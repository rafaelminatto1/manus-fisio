-- ============================================================================
-- MIGRACAO URGENTE: Otimizações de Performance RLS
-- Data: 2024-11-25
-- ============================================================================

-- 1. Otimizar políticas RLS para melhor performance
-- Ref: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- 1.1. Otimizar políticas da tabela users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Mentors can view intern profiles" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Mentors can view intern profiles" ON public.users
  FOR SELECT USING (
    (SELECT public.is_mentor((SELECT auth.uid()))) AND role = 'intern'
  );

-- 1.2. Otimizar políticas da tabela notebooks
DROP POLICY IF EXISTS "Users can view notebooks they have access to" ON public.notebooks;
DROP POLICY IF EXISTS "Users can create notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can update notebooks they have write access to" ON public.notebooks;
DROP POLICY IF EXISTS "Users can delete notebooks they created" ON public.notebooks;

CREATE POLICY "Users can view notebooks they have access to" ON public.notebooks
  FOR SELECT USING (
    is_public = true OR 
    created_by = (SELECT auth.uid()) OR
    (SELECT public.has_notebook_permission(id, (SELECT auth.uid()), 'read'))
  );

CREATE POLICY "Users can create notebooks" ON public.notebooks
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update notebooks they have write access to" ON public.notebooks
  FOR UPDATE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.has_notebook_permission(id, (SELECT auth.uid()), 'write'))
  );

CREATE POLICY "Users can delete notebooks they created" ON public.notebooks
  FOR DELETE USING (created_by = (SELECT auth.uid()));

-- 1.3. Otimizar políticas da tabela projects  
DROP POLICY IF EXISTS "Users can view projects they have access to" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects they have write access to" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects they created" ON public.projects;

CREATE POLICY "Users can view projects they have access to" ON public.projects
  FOR SELECT USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.has_project_permission(id, (SELECT auth.uid()), 'read'))
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update projects they have write access to" ON public.projects
  FOR UPDATE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.has_project_permission(id, (SELECT auth.uid()), 'write'))
  );

CREATE POLICY "Users can delete projects they created" ON public.projects
  FOR DELETE USING (created_by = (SELECT auth.uid()));

-- 1.4. Otimizar políticas da tabela activity_logs
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;

CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 1.5. Otimizar políticas da tabela pages
DROP POLICY IF EXISTS "Users can create pages in writable notebooks" ON public.pages;
DROP POLICY IF EXISTS "Users can delete pages they created" ON public.pages;

CREATE POLICY "Users can create pages in writable notebooks" ON public.pages
  FOR INSERT WITH CHECK (
    (SELECT public.has_notebook_permission(notebook_id, (SELECT auth.uid()), 'write'))
  );

CREATE POLICY "Users can delete pages they created" ON public.pages
  FOR DELETE USING (created_by = (SELECT auth.uid()));

-- 1.6. Otimizar políticas da tabela tasks
DROP POLICY IF EXISTS "Users can create tasks in writable projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in writable projects or assigned to them" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created" ON public.tasks;

CREATE POLICY "Users can create tasks in writable projects" ON public.tasks
  FOR INSERT WITH CHECK (
    (SELECT public.has_project_permission(project_id, (SELECT auth.uid()), 'write'))
  );

CREATE POLICY "Users can update tasks in writable projects or assigned to them" ON public.tasks
  FOR UPDATE USING (
    assigned_to = (SELECT auth.uid()) OR
    (SELECT public.has_project_permission(project_id, (SELECT auth.uid()), 'write'))
  );

CREATE POLICY "Users can delete tasks they created" ON public.tasks
  FOR DELETE USING (created_by = (SELECT auth.uid()));

-- 1.7. Otimizar políticas da tabela mentorships
DROP POLICY IF EXISTS "Mentors can view their mentorships" ON public.mentorships;
DROP POLICY IF EXISTS "Mentors can create mentorships" ON public.mentorships;
DROP POLICY IF EXISTS "Mentors can update their mentorships" ON public.mentorships;

CREATE POLICY "Mentors can view their mentorships" ON public.mentorships
  FOR SELECT USING (
    mentor_id = (SELECT auth.uid()) OR 
    intern_id = (SELECT auth.uid()) OR
    (SELECT public.is_admin((SELECT auth.uid())))
  );

CREATE POLICY "Mentors can create mentorships" ON public.mentorships
  FOR INSERT WITH CHECK ((SELECT public.is_mentor((SELECT auth.uid()))));

CREATE POLICY "Mentors can update their mentorships" ON public.mentorships
  FOR UPDATE USING (
    mentor_id = (SELECT auth.uid()) OR
    (SELECT public.is_admin((SELECT auth.uid())))
  );

-- 1.8. Otimizar políticas da tabela comments
DROP POLICY IF EXISTS "Users can create comments on accessible content" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can create comments on accessible content" ON public.comments
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (author_id = (SELECT auth.uid()));

-- 2. Remover índices não utilizados para economizar espaço
-- (Comentados para segurança - aplicar após verificação)
-- DROP INDEX IF EXISTS public.idx_notebooks_search;
-- DROP INDEX IF EXISTS public.idx_pages_parent_id;
-- DROP INDEX IF EXISTS public.idx_pages_slug;
-- DROP INDEX IF EXISTS public.idx_projects_status;
-- DROP INDEX IF EXISTS public.idx_tasks_status; 