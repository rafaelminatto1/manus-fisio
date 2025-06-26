-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is mentor
CREATE OR REPLACE FUNCTION is_mentor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('admin', 'mentor')
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission on notebook
CREATE OR REPLACE FUNCTION has_notebook_permission(notebook_uuid UUID, permission_level TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin can access everything
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Creator has full access
    IF (SELECT created_by FROM notebooks WHERE id = notebook_uuid) = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    -- Check collaborator permissions
    RETURN EXISTS (
        SELECT 1 FROM notebook_collaborators nc
        WHERE nc.notebook_id = notebook_uuid 
        AND nc.user_id = auth.uid()
        AND (
            permission_level = 'read' OR
            (permission_level = 'write' AND nc.permission IN ('write', 'admin')) OR
            (permission_level = 'admin' AND nc.permission = 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission on project
CREATE OR REPLACE FUNCTION has_project_permission(project_uuid UUID, permission_level TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin can access everything
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Creator has full access
    IF (SELECT created_by FROM projects WHERE id = project_uuid) = auth.uid() THEN
        RETURN TRUE;
    END IF;
    
    -- Check collaborator permissions
    RETURN EXISTS (
        SELECT 1 FROM project_collaborators pc
        WHERE pc.project_id = project_uuid 
        AND pc.user_id = auth.uid()
        AND (
            permission_level = 'read' OR
            (permission_level = 'write' AND pc.permission IN ('write', 'admin')) OR
            (permission_level = 'admin' AND pc.permission = 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Mentors can view intern profiles" ON users
    FOR SELECT USING (
        is_mentor() AND (
            role = 'intern' OR 
            id = auth.uid() OR
            is_admin()
        )
    );

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (is_admin());

-- Notebooks policies
CREATE POLICY "Anyone can view public notebooks" ON notebooks
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view notebooks they have access to" ON notebooks
    FOR SELECT USING (
        created_by = auth.uid() OR
        has_notebook_permission(id, 'read')
    );

CREATE POLICY "Users can create notebooks" ON notebooks
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update notebooks they have write access to" ON notebooks
    FOR UPDATE USING (
        created_by = auth.uid() OR
        has_notebook_permission(id, 'write')
    );

CREATE POLICY "Users can delete notebooks they created" ON notebooks
    FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all notebooks" ON notebooks
    FOR ALL USING (is_admin());

-- Pages policies
CREATE POLICY "Users can view pages from accessible notebooks" ON pages
    FOR SELECT USING (
        has_notebook_permission(notebook_id, 'read')
    );

CREATE POLICY "Users can create pages in writable notebooks" ON pages
    FOR INSERT WITH CHECK (
        has_notebook_permission(notebook_id, 'write') AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update pages in writable notebooks" ON pages
    FOR UPDATE USING (
        has_notebook_permission(notebook_id, 'write')
    );

CREATE POLICY "Users can delete pages they created" ON pages
    FOR DELETE USING (
        created_by = auth.uid() OR
        has_notebook_permission(notebook_id, 'admin')
    );

-- Projects policies
CREATE POLICY "Users can view projects they have access to" ON projects
    FOR SELECT USING (
        created_by = auth.uid() OR
        has_project_permission(id, 'read')
    );

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update projects they have write access to" ON projects
    FOR UPDATE USING (
        created_by = auth.uid() OR
        has_project_permission(id, 'write')
    );

CREATE POLICY "Users can delete projects they created" ON projects
    FOR DELETE USING (created_by = auth.uid());

-- Tasks policies
CREATE POLICY "Users can view tasks from accessible projects" ON tasks
    FOR SELECT USING (
        has_project_permission(project_id, 'read')
    );

CREATE POLICY "Users can create tasks in writable projects" ON tasks
    FOR INSERT WITH CHECK (
        has_project_permission(project_id, 'write') AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update tasks in writable projects or assigned to them" ON tasks
    FOR UPDATE USING (
        has_project_permission(project_id, 'write') OR
        assigned_to = auth.uid()
    );

CREATE POLICY "Users can delete tasks they created" ON tasks
    FOR DELETE USING (
        created_by = auth.uid() OR
        has_project_permission(project_id, 'admin')
    );

-- Mentorships policies
CREATE POLICY "Mentors can view their mentorships" ON mentorships
    FOR SELECT USING (
        mentor_id = auth.uid() OR 
        intern_id = auth.uid() OR
        is_admin()
    );

CREATE POLICY "Mentors can create mentorships" ON mentorships
    FOR INSERT WITH CHECK (
        mentor_id = auth.uid() AND is_mentor()
    );

CREATE POLICY "Mentors can update their mentorships" ON mentorships
    FOR UPDATE USING (
        mentor_id = auth.uid() OR is_admin()
    );

CREATE POLICY "Admins can delete mentorships" ON mentorships
    FOR DELETE USING (is_admin());

-- Comments policies
CREATE POLICY "Users can view comments on accessible content" ON comments
    FOR SELECT USING (
        (page_id IS NOT NULL AND has_notebook_permission((SELECT notebook_id FROM pages WHERE id = page_id), 'read')) OR
        (project_id IS NOT NULL AND has_project_permission(project_id, 'read')) OR
        (task_id IS NOT NULL AND has_project_permission((SELECT project_id FROM tasks WHERE id = task_id), 'read'))
    );

CREATE POLICY "Users can create comments on accessible content" ON comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND (
            (page_id IS NOT NULL AND has_notebook_permission((SELECT notebook_id FROM pages WHERE id = page_id), 'read')) OR
            (project_id IS NOT NULL AND has_project_permission(project_id, 'read')) OR
            (task_id IS NOT NULL AND has_project_permission((SELECT project_id FROM tasks WHERE id = task_id), 'read'))
        )
    );

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (
        author_id = auth.uid() OR is_admin()
    );

-- Activity logs policies (read-only for auditing)
CREATE POLICY "Admins can view all activity logs" ON activity_logs
    FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own activity logs" ON activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- Collaborators policies
CREATE POLICY "Users can view notebook collaborators" ON notebook_collaborators
    FOR SELECT USING (
        has_notebook_permission(notebook_id, 'read')
    );

CREATE POLICY "Notebook admins can manage collaborators" ON notebook_collaborators
    FOR ALL USING (
        has_notebook_permission(notebook_id, 'admin')
    );

CREATE POLICY "Users can view project collaborators" ON project_collaborators
    FOR SELECT USING (
        has_project_permission(project_id, 'read')
    );

CREATE POLICY "Project admins can manage collaborators" ON project_collaborators
    FOR ALL USING (
        has_project_permission(project_id, 'admin')
    );

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 