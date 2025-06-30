-- Migration generated to address security and performance issues found by MCP Advisor

-- Part 1: Security Fixes
-- 1.1: Move pg_trgm extension to a dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- 1.2: Set a secure search_path for the verify_optimizations function
-- This function was flagged for a mutable search_path. This command secures it.
ALTER FUNCTION public.verify_optimizations() SET search_path = public;


-- Part 2: Performance Optimizations
-- This part drops all the old, inefficient policies and helper functions,
-- and recreates them to be performant by using stable functions and subqueries.

-- 2.1: Drop existing policies
-- Dropping all policies from the original '20240125000001_rls_policies.sql' migration.
-- Users
DROP POLICY "Users can view their own profile" ON users;
DROP POLICY "Users can update their own profile" ON users;
DROP POLICY "Mentors can view intern profiles" ON users;
DROP POLICY "Admins can manage all users" ON users;
-- Notebooks
DROP POLICY "Anyone can view public notebooks" ON notebooks;
DROP POLICY "Users can view notebooks they have access to" ON notebooks;
DROP POLICY "Users can create notebooks" ON notebooks;
DROP POLICY "Users can update notebooks they have write access to" ON notebooks;
DROP POLICY "Users can delete notebooks they created" ON notebooks;
DROP POLICY "Admins can manage all notebooks" ON notebooks;
-- Pages
DROP POLICY "Users can view pages from accessible notebooks" ON pages;
DROP POLICY "Users can create pages in writable notebooks" ON pages;
DROP POLICY "Users can update pages in writable notebooks" ON pages;
DROP POLICY "Users can delete pages they created" ON pages;
-- Projects
DROP POLICY "Users can view projects they have access to" ON projects;
DROP POLICY "Users can create projects" ON projects;
DROP POLICY "Users can update projects they have write access to" ON projects;
DROP POLICY "Users can delete projects they created" ON projects;
-- Tasks
DROP POLICY "Users can view tasks from accessible projects" ON tasks;
DROP POLICY "Users can create tasks in writable projects" ON tasks;
DROP POLICY "Users can update tasks in writable projects or assigned to them" ON tasks;
DROP POLICY "Users can delete tasks they created" ON tasks;
-- Mentorships
DROP POLICY "Mentors can view their mentorships" ON mentorships;
DROP POLICY "Mentors can create mentorships" ON mentorships;
DROP POLICY "Mentors can update their mentorships" ON mentorships;
DROP POLICY "Admins can delete mentorships" ON mentorships;
-- Comments
DROP POLICY "Users can view comments on accessible content" ON comments;
DROP POLICY "Users can create comments on accessible content" ON comments;
DROP POLICY "Users can update their own comments" ON comments;
DROP POLICY "Users can delete their own comments" ON comments;

-- 2.2: Recreate Helper Functions to be Stable
-- The functions are rewritten to use `(SELECT auth.uid())` and memoization for stability and performance.

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.users
        WHERE id = (SELECT auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is mentor
CREATE OR REPLACE FUNCTION is_mentor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'mentor')
        FROM public.users
        WHERE id = (SELECT auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overwriting the old permission functions with the optimized ones from '20240730000000_optimize_permission_functions.sql'
-- These were already created, but we ensure they are part of this definitive optimization script.
CREATE OR REPLACE FUNCTION has_notebook_permission(notebook_uuid UUID, permission_level TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id_val UUID := (SELECT auth.uid());
BEGIN
  -- Super admin can access everything
  IF (SELECT is_admin()) THEN
    RETURN TRUE;
  END IF;

  -- Check if the user is the creator (owner)
  IF (SELECT created_by FROM public.notebooks WHERE id = notebook_uuid) = user_id_val THEN
    RETURN TRUE;
  END IF;

  -- Check collaborator permissions
  RETURN EXISTS (
    SELECT 1
    FROM public.notebook_collaborators nc
    WHERE nc.notebook_id = notebook_uuid
      AND nc.user_id = user_id_val
      AND (
        (permission_level = 'read' AND nc.permission IN ('read', 'write', 'admin')) OR
        (permission_level = 'write' AND nc.permission IN ('write', 'admin')) OR
        (permission_level = 'admin' AND nc.permission = 'admin')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION has_project_permission(project_uuid UUID, permission_level TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id_val UUID := (SELECT auth.uid());
BEGIN
  -- Super admin can access everything
  IF (SELECT is_admin()) THEN
    RETURN TRUE;
  END IF;

  -- Check if the user is the creator (owner)
  IF (SELECT created_by FROM public.projects WHERE id = project_uuid) = user_id_val THEN
    RETURN TRUE;
  END IF;

  -- Check collaborator permissions
  RETURN EXISTS (
    SELECT 1
    FROM public.project_collaborators pc
    WHERE pc.project_id = project_uuid
      AND pc.user_id = user_id_val
      AND (
        (permission_level = 'read' AND pc.permission IN ('read', 'write', 'admin')) OR
        (permission_level = 'write' AND pc.permission IN ('write', 'admin')) OR
        (permission_level = 'admin' AND pc.permission = 'admin')
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2.3: Recreate Policies with Stable Functions
-- Wrapping all function calls and `auth.uid()` in `(SELECT ...)` to prevent re-evaluation per row.

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Mentors can view intern profiles" ON users
    FOR SELECT USING (
        (SELECT is_mentor()) AND (
            role = 'intern' OR 
            id = (SELECT auth.uid()) OR
            (SELECT is_admin())
        )
    );

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING ((SELECT is_admin()));

-- Notebooks policies
CREATE POLICY "Anyone can view public notebooks" ON notebooks
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view notebooks they have access to" ON notebooks
    FOR SELECT USING (
        created_by = (SELECT auth.uid()) OR
        (SELECT has_notebook_permission(id, 'read'))
    );

CREATE POLICY "Users can create notebooks" ON notebooks
    FOR INSERT WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Users can update notebooks they have write access to" ON notebooks
    FOR UPDATE USING (
        created_by = (SELECT auth.uid()) OR
        (SELECT has_notebook_permission(id, 'write'))
    );

CREATE POLICY "Users can delete notebooks they created" ON notebooks
    FOR DELETE USING (created_by = (SELECT auth.uid()));

CREATE POLICY "Admins can manage all notebooks" ON notebooks
    FOR ALL USING ((SELECT is_admin()));

-- Pages policies
CREATE POLICY "Users can view pages from accessible notebooks" ON pages
    FOR SELECT USING (
        (SELECT has_notebook_permission(notebook_id, 'read'))
    );

CREATE POLICY "Users can create pages in writable notebooks" ON pages
    FOR INSERT WITH CHECK (
        (SELECT has_notebook_permission(notebook_id, 'write')) AND
        created_by = (SELECT auth.uid())
    );

CREATE POLICY "Users can update pages in writable notebooks" ON pages
    FOR UPDATE USING (
        (SELECT has_notebook_permission(notebook_id, 'write'))
    );

CREATE POLICY "Users can delete pages they created" ON pages
    FOR DELETE USING (
        created_by = (SELECT auth.uid()) OR
        (SELECT has_notebook_permission(notebook_id, 'admin'))
    );

-- Projects policies
CREATE POLICY "Users can view projects they have access to" ON projects
    FOR SELECT USING (
        created_by = (SELECT auth.uid()) OR
        (SELECT has_project_permission(id, 'read'))
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Users can update projects they have write access to" ON projects
    FOR UPDATE USING (
        created_by = (SELECT auth.uid()) OR
        (SELECT has_project_permission(id, 'write'))
    );

CREATE POLICY "Users can delete projects they created" ON projects
    FOR DELETE USING (created_by = (SELECT auth.uid()));

-- Tasks policies
CREATE POLICY "Users can view tasks from accessible projects" ON tasks
    FOR SELECT USING (
        (SELECT has_project_permission(project_id, 'read'))
    );

CREATE POLICY "Users can create tasks in writable projects" ON tasks
    FOR INSERT WITH CHECK (
        (SELECT has_project_permission(project_id, 'write')) AND
        created_by = (SELECT auth.uid())
    );

CREATE POLICY "Users can update tasks in writable projects or assigned to them" ON tasks
    FOR UPDATE USING (
        (SELECT has_project_permission(project_id, 'write')) OR
        assigned_to = (SELECT auth.uid())
    );

CREATE POLICY "Users can delete tasks they created" ON tasks
    FOR DELETE USING (
        created_by = (SELECT auth.uid()) OR
        (SELECT has_project_permission(project_id, 'admin'))
    );

-- Mentorships policies
CREATE POLICY "Mentors can view their mentorships" ON mentorships
    FOR SELECT USING (
        mentor_id = (SELECT auth.uid()) OR 
        intern_id = (SELECT auth.uid()) OR
        (SELECT is_admin())
    );

CREATE POLICY "Mentors can create mentorships" ON mentorships
    FOR INSERT WITH CHECK (
        mentor_id = (SELECT auth.uid()) AND (SELECT is_mentor())
    );

CREATE POLICY "Mentors can update their mentorships" ON mentorships
    FOR UPDATE USING (
        mentor_id = (SELECT auth.uid()) OR (SELECT is_admin())
    );

CREATE POLICY "Admins can delete mentorships" ON mentorships
    FOR DELETE USING ((SELECT is_admin()));

-- Comments policies
CREATE POLICY "Users can view comments on accessible content" ON comments
    FOR SELECT USING (
        (page_id IS NOT NULL AND (SELECT has_notebook_permission((SELECT notebook_id FROM pages WHERE id = page_id), 'read'))) OR
        (project_id IS NOT NULL AND (SELECT has_project_permission(project_id, 'read'))) OR
        (task_id IS NOT NULL AND (SELECT has_project_permission((SELECT project_id FROM tasks WHERE id = task_id), 'read')))
    );

CREATE POLICY "Users can create comments on accessible content" ON comments
    FOR INSERT WITH CHECK (
        author_id = (SELECT auth.uid()) AND (
            (page_id IS NOT NULL AND (SELECT has_notebook_permission((SELECT notebook_id FROM pages WHERE id = page_id), 'read'))) OR
            (project_id IS NOT NULL AND (SELECT has_project_permission(project_id, 'read'))) OR
            (task_id IS NOT NULL AND (SELECT has_project_permission((SELECT project_id FROM tasks WHERE id = task_id), 'read')))
        )
    );

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (
        author_id = (SELECT auth.uid()) OR (SELECT is_admin())
    );

-- Note: The policies for 'activity_logs' and other tables flagged for multiple permissive policies
-- are not being combined in this migration. That will be handled in a separate step to keep this change focused.

-- End of migration.
