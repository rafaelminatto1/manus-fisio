const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://hycudcwtuocmufahpsnmr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3VkY3d0dW9jbXVmYWhwc25tciIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzcwNDEwODQsImV4cCI6MjA1MjYxNzA4NH0.WN6r0TejH0LKqTPmQYyQfF8Q7SMLM-yfF1x8a_BPVYs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  console.log('🚀 Iniciando aplicação do schema...');

  try {
    // Schema simplificado sem tipos customizados
    const schema = `
      -- Criar tabela de usuários
      CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          avatar_url TEXT,
          role TEXT DEFAULT 'guest' CHECK (role IN ('admin', 'mentor', 'intern', 'guest')),
          crefito TEXT,
          specialty TEXT,
          university TEXT,
          semester INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabela de notebooks
      CREATE TABLE IF NOT EXISTS public.notebooks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          icon TEXT DEFAULT '📁',
          color TEXT DEFAULT 'default',
          category TEXT NOT NULL,
          is_public BOOLEAN DEFAULT false,
          created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabela de páginas
      CREATE TABLE IF NOT EXISTS public.pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content JSONB DEFAULT '{}',
          slug TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          is_published BOOLEAN DEFAULT false,
          created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(notebook_id, slug)
      );

      -- Criar tabela de projetos
      CREATE TABLE IF NOT EXISTS public.projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          due_date DATE,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabela de tarefas
      CREATE TABLE IF NOT EXISTS public.tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
          due_date DATE,
          estimated_hours INTEGER,
          actual_hours INTEGER DEFAULT 0,
          order_index INTEGER DEFAULT 0,
          created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabela de mentorias
      CREATE TABLE IF NOT EXISTS public.mentorships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          mentor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          intern_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
          start_date DATE NOT NULL,
          end_date DATE,
          required_hours INTEGER DEFAULT 300,
          completed_hours INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(mentor_id, intern_id, start_date)
      );

      -- Criar tabela de comentários
      CREATE TABLE IF NOT EXISTS public.comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
          task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CHECK (
              (page_id IS NOT NULL AND project_id IS NULL AND task_id IS NULL) OR
              (page_id IS NULL AND project_id IS NOT NULL AND task_id IS NULL) OR
              (page_id IS NULL AND project_id IS NULL AND task_id IS NOT NULL)
          )
      );

      -- Criar tabela de logs de atividade
      CREATE TABLE IF NOT EXISTS public.activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id UUID NOT NULL,
          old_values JSONB,
          new_values JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar tabelas de colaboradores
      CREATE TABLE IF NOT EXISTS public.notebook_collaborators (
          notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          permission TEXT DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (notebook_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS public.project_collaborators (
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          permission TEXT DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (project_id, user_id)
      );
    `;

    // Aplicar schema via RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Erro ao aplicar schema:', error);
      return;
    }

    console.log('✅ Schema aplicado com sucesso!');

    // Criar índices
    const indexes = `
      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
      CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
      CREATE INDEX IF NOT EXISTS idx_notebooks_category ON public.notebooks(category);
      CREATE INDEX IF NOT EXISTS idx_notebooks_created_by ON public.notebooks(created_by);
      CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON public.pages(notebook_id);
      CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON public.pages(parent_id);
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
      CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON public.mentorships(mentor_id);
      CREATE INDEX IF NOT EXISTS idx_mentorships_intern_id ON public.mentorships(intern_id);
      CREATE INDEX IF NOT EXISTS idx_comments_page_id ON public.comments(page_id);
      CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
      CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
    `;

    const { data: indexData, error: indexError } = await supabase.rpc('exec_sql', { sql: indexes });
    
    if (indexError) {
      console.error('⚠️ Erro ao criar índices:', indexError);
    } else {
      console.log('✅ Índices criados com sucesso!');
    }

    console.log('🎉 Banco de dados configurado completamente!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
applySchema(); 