# SCHEMA FINAL - MANUS FISIO

## Acesse: https://supabase.com/dashboard/project/hycudcwtuocmufahpsnmr
## Vá em SQL Editor > New Query
## Cole e execute o SQL abaixo:

-- SCHEMA COMPLETO
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

-- RLS e Políticas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY \
Enable
all
for
authenticated
users\ ON users FOR ALL TO authenticated USING (true);
CREATE POLICY \Enable
all
for
authenticated
users\ ON notebooks FOR ALL TO authenticated USING (true);
CREATE POLICY \Enable
all
for
authenticated
users\ ON pages FOR ALL TO authenticated USING (true);
CREATE POLICY \Enable
all
for
authenticated
users\ ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY \Enable
all
for
authenticated
users\ ON tasks FOR ALL TO authenticated USING (true);

-- Usuário admin
INSERT INTO users (id, email, full_name, role, crefito, specialty) 
VALUES (
    gen_random_uuid(),
    'admin@manusfisio.com',
    'Administrador Sistema',
    'admin',
    'CREFITO-1234',
    'Fisioterapia Geral'
) ON CONFLICT (email) DO NOTHING;

## Depois acesse: http://localhost:3001
## Login: admin@manusfisio.com

