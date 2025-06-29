-- MIGRATION: Adiciona o Módulo de Pacientes e Prontuários Eletrônicos
-- Versão: 1
-- Data: 28 de junho de 2025
--
-- INSTRUÇÕES:
-- 1. Acesse o painel do seu projeto no Supabase.
-- 2. No menu lateral, clique no ícone de banco de dados para ir para o "Database".
-- 3. Selecione "SQL Editor".
-- 4. Clique em "+ New query".
-- 5. Copie TODO o conteúdo deste arquivo e cole no editor de SQL.
-- 6. Clique em "RUN" para executar o script.
--
-- =================================================================================================

-- 1. CRIAÇÃO DAS TABELAS

-- Tabela principal para armazenar os dados demográficos dos pacientes
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT,
    cpf TEXT UNIQUE, -- Dado sensível, idealmente criptografado em nível de aplicação ou com pgsodium
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    initial_medical_history TEXT, -- Um resumo do histórico inicial
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para os registros de prontuário (evoluções de cada sessão)
CREATE TABLE public.patient_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    content JSONB NOT NULL, -- Conteúdo da evolução, usando a estrutura do Editor Rico
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Fisioterapeuta que realizou a sessão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação para vincular pacientes a projetos
CREATE TABLE public.project_patients (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, patient_id)
);

-- 2. CRIAÇÃO DOS ÍNDICES PARA PERFORMANCE

CREATE INDEX idx_patients_full_name ON public.patients USING gin(to_tsvector('portuguese', full_name));
CREATE INDEX idx_patient_records_patient_id ON public.patient_records(patient_id);
CREATE INDEX idx_project_patients_project_id ON public.project_patients(project_id);
CREATE INDEX idx_project_patients_patient_id ON public.project_patients(patient_id);

-- 3. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_patients ENABLE ROW LEVEL SECURITY;

-- 4. DEFINIÇÃO DAS POLÍTICAS DE ACESSO (RLS)

-- Política para a tabela 'patients'
CREATE POLICY "Admins podem gerenciar todos os pacientes" ON public.patients
    FOR ALL USING (is_admin());

CREATE POLICY "Fisioterapeutas podem ver pacientes de seus projetos" ON public.patients
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        JOIN project_patients pp ON pc.project_id = pp.project_id
        WHERE pp.patient_id = public.patients.id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Fisioterapeutas podem criar pacientes" ON public.patients
    FOR INSERT WITH CHECK (is_mentor()); -- Reutilizando a função is_mentor() para 'fisioterapeuta'

-- Política para a tabela 'patient_records'
CREATE POLICY "Admins podem gerenciar todos os prontuários" ON public.patient_records
    FOR ALL USING (is_admin());

CREATE POLICY "Fisioterapeutas podem gerenciar prontuários de seus pacientes" ON public.patient_records
    FOR ALL USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        JOIN project_patients pp ON pc.project_id = pp.project_id
        WHERE pp.patient_id = public.patient_records.patient_id AND pc.user_id = auth.uid()
    ));

-- Política para a tabela 'project_patients'
CREATE POLICY "Membros do projeto podem ver as associações" ON public.project_patients
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        WHERE pc.project_id = public.project_patients.project_id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Admins e criadores de projetos podem gerenciar associações" ON public.project_patients
    FOR ALL USING (is_admin() OR has_project_permission(project_id, 'admin')); 