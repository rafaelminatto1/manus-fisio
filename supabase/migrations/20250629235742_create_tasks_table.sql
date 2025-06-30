-- Tabela para Gerenciamento de Tarefas (Estilo Kanban)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL CHECK (char_length(title) > 3),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo', -- e.g., 'todo', 'in_progress', 'done', 'archived'
    priority TEXT DEFAULT 'medium', -- e.g., 'low', 'medium', 'high', 'urgent'
    due_date TIMESTAMPTZ,
    
    -- Relacionamentos
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Trigger para atualizar 'updated_at'
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);

-- Índices para otimização de consultas
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_patient_id ON tasks(patient_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);


-- Políticas de Segurança (RLS)

-- 1. Usuários podem ver tarefas que eles criaram.
CREATE POLICY "Allow individual read access for creators"
ON tasks
FOR SELECT
USING (auth.uid() = created_by);

-- 2. Usuários podem ver tarefas que foram atribuídas a eles.
CREATE POLICY "Allow individual read access for assignees"
ON tasks
FOR SELECT
USING (auth.uid() = assigned_to);

-- 3. Usuários podem criar tarefas.
CREATE POLICY "Allow users to create tasks"
ON tasks
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- 4. Usuários podem atualizar tarefas que foram atribuídas a eles.
CREATE POLICY "Allow users to update their assigned tasks"
ON tasks
FOR UPDATE
USING (auth.uid() = assigned_to)
WITH CHECK (auth.uid() = assigned_to);

-- 5. Usuários podem deletar tarefas que eles criaram.
CREATE POLICY "Allow creators to delete their tasks"
ON tasks
FOR DELETE
USING (auth.uid() = created_by);
