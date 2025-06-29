# 🚀 APLICAR MIGRAÇÃO VIA SUPABASE DASHBOARD

## ✅ Status Atual
- ✅ Servidor Next.js funcionando (localhost:3000)
- ✅ Erro PostCSS corrigido
- ✅ Código do módulo de pacientes implementado
- ❌ **PENDENTE**: Aplicar migração no banco

## 📋 PASSO A PASSO SIMPLES

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard
- Login com sua conta
- Selecione o projeto: `hycudcwtuocmufhpsnmr`

### 2. Vá para SQL Editor
- Clique em "SQL Editor" no menu lateral
- Clique em "New Query"

### 3. Cole e Execute o SQL
```sql
-- CRIAÇÃO DAS TABELAS DE PACIENTES

-- 1. Tabela de pacientes
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT,
    cpf TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    initial_medical_history TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de prontuários
CREATE TABLE public.patient_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    content JSONB NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de associação projeto-paciente
CREATE TABLE public.project_patients (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (project_id, patient_id)
);

-- 4. Índices para performance
CREATE INDEX idx_patients_full_name ON public.patients USING gin(to_tsvector('portuguese', full_name));
CREATE INDEX idx_patient_records_patient_id ON public.patient_records(patient_id);
CREATE INDEX idx_project_patients_project_id ON public.project_patients(project_id);
CREATE INDEX idx_project_patients_patient_id ON public.project_patients(patient_id);

-- 5. Habilitar RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_patients ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de segurança
CREATE POLICY "Admins podem gerenciar todos os pacientes" ON public.patients
    FOR ALL USING (is_admin());

CREATE POLICY "Fisioterapeutas podem ver pacientes de seus projetos" ON public.patients
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        JOIN project_patients pp ON pc.project_id = pp.project_id
        WHERE pp.patient_id = public.patients.id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Fisioterapeutas podem criar pacientes" ON public.patients
    FOR INSERT WITH CHECK (is_mentor());

CREATE POLICY "Admins podem gerenciar todos os prontuários" ON public.patient_records
    FOR ALL USING (is_admin());

CREATE POLICY "Fisioterapeutas podem gerenciar prontuários de seus pacientes" ON public.patient_records
    FOR ALL USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        JOIN project_patients pp ON pc.project_id = pp.project_id
        WHERE pp.patient_id = public.patient_records.patient_id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Membros do projeto podem ver as associações" ON public.project_patients
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        WHERE pc.project_id = public.project_patients.project_id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Admins e criadores de projetos podem gerenciar associações" ON public.project_patients
    FOR ALL USING (is_admin() OR has_project_permission(project_id, 'admin'));
```

### 4. Clique em "RUN"
- O SQL será executado
- Aguarde a confirmação de sucesso

### 5. Teste o Sistema
- Acesse: http://localhost:3000/patients
- Teste a criação de um novo paciente
- Verifique as funcionalidades

## 🎯 APÓS A MIGRAÇÃO

O sistema estará 100% funcional com:
- ✅ Módulo de pacientes completo
- ✅ APIs REST funcionando
- ✅ Interface de usuário pronta
- ✅ Segurança RLS configurada
- ✅ Performance otimizada

## 🆘 Se der erro

Se algum comando der erro, execute um por vez:
1. Primeiro as 3 tabelas (CREATE TABLE)
2. Depois os índices (CREATE INDEX)
3. Por último as políticas (CREATE POLICY)

**Status**: 🟡 Aguardando aplicação da migração 