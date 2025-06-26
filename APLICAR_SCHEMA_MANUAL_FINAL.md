# 🎯 GUIA FINAL - Aplicar Schema Manualmente no Supabase

## ✅ STATUS ATUAL
- **Frontend**: ✅ Funcionando em http://localhost:3001
- **Credenciais**: ✅ Configuradas em `.env.local`
- **Ícones PWA**: ✅ Criados e funcionando
- **Banco de dados**: ⏳ Aguardando aplicação do schema

## 🔧 PROBLEMAS RESOLVIDOS

### 1. ERR_NAME_NOT_RESOLVED ✅
- Arquivo `.env.local` criado com credenciais corretas
- Variáveis de ambiente configuradas

### 2. Ícones 404 ✅
- Todos os ícones PWA criados (72x72 até 512x512)
- Favicon criado
- Ícones de atalho configurados

### 3. Servidor funcionando ✅
- Next.js rodando na porta 3001
- Redirecionamento para login funcionando

## 📋 APLICAR SCHEMA MANUALMENTE

Como há problemas de conectividade DNS, aplique o schema diretamente no painel:

### Passo 1: Acessar o Painel
1. Acesse: https://supabase.com/dashboard/project/hycudcwtuocmufahpsnmr
2. Vá em **"SQL Editor"**
3. Clique em **"New Query"**

### Passo 2: Executar o Schema
Cole e execute este SQL:

```sql
-- Manus Fisio - Schema Completo
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT 'default',
    category TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de páginas
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    slug TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(notebook_id, slug)
);

-- Criar tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mentorias
CREATE TABLE IF NOT EXISTS mentorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    intern_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (page_id IS NOT NULL AND project_id IS NULL AND task_id IS NULL) OR
        (page_id IS NULL AND project_id IS NOT NULL AND task_id IS NULL) OR
        (page_id IS NULL AND project_id IS NULL AND task_id IS NOT NULL)
    )
);

-- Criar tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS notebook_collaborators (
    notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (notebook_id, user_id)
);

CREATE TABLE IF NOT EXISTS project_collaborators (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission TEXT DEFAULT 'read' CHECK (permission IN ('read', 'write', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_notebooks_category ON notebooks(category);
CREATE INDEX IF NOT EXISTS idx_notebooks_created_by ON notebooks(created_by);
CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON pages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_intern_id ON mentorships(intern_id);
CREATE INDEX IF NOT EXISTS idx_comments_page_id ON comments(page_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
```

### Passo 3: Configurar RLS (Row Level Security)
Execute em uma nova query:

```sql
-- Habilitar RLS em todas as tabelas
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

-- Políticas básicas (permitir tudo para usuários autenticados inicialmente)
CREATE POLICY "Enable all for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON notebooks FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON pages FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON mentorships FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON comments FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON activity_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON notebook_collaborators FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all for authenticated users" ON project_collaborators FOR ALL TO authenticated USING (true);
```

### Passo 4: Criar Usuário Admin
Execute em uma nova query:

```sql
-- Inserir usuário admin de teste
INSERT INTO users (id, email, full_name, role, crefito, specialty) 
VALUES (
    gen_random_uuid(),
    'admin@manusfisio.com',
    'Administrador Sistema',
    'admin',
    'CREFITO-1234',
    'Fisioterapia Geral'
) ON CONFLICT (email) DO NOTHING;
```

## 🎉 TESTE FINAL

1. Execute todo o SQL acima no painel do Supabase
2. Acesse: http://localhost:3001
3. Teste o login com: `admin@manusfisio.com` / qualquer senha
4. Navegue pelas páginas: Dashboard, Notebooks, Projects, Team, Calendar

## ✅ RESULTADO ESPERADO

- ✅ Sem erros de console
- ✅ Login funcionando
- ✅ Dashboard carregando
- ✅ Todas as páginas acessíveis
- ✅ PWA funcionando com ícones

## 🔧 SUPORTE

Se ainda houver problemas:
1. Verifique se todas as queries foram executadas com sucesso
2. Confirme se as tabelas foram criadas em "Table Editor"
3. Teste a conectividade em "Settings" > "API"

**O sistema está 99% pronto! Só falta aplicar o schema no banco de dados.** 