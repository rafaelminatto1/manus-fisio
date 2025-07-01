-- =====================================================
-- MANUS FISIO - SCHEMA COMPLETO DE FISIOTERAPIA
-- Data: 29/01/2025
-- Versão: 1.0 - Schema Especializado
-- =====================================================

-- 1. TABELA DE AVALIAÇÕES FISIOTERAPÊUTICAS
CREATE TABLE IF NOT EXISTS physiotherapy_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dados da Consulta
    evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    main_complaint TEXT NOT NULL,
    pain_scale_initial INTEGER CHECK (pain_scale_initial >= 0 AND pain_scale_initial <= 10),
    pain_location TEXT,
    pain_characteristics TEXT,
    
    -- História Clínica
    medical_history TEXT,
    previous_treatments TEXT,
    medications TEXT,
    lifestyle_factors TEXT,
    
    -- Exame Físico
    posture_analysis TEXT,
    muscle_strength JSONB, -- {"muscle_group": "strength_grade"}
    range_of_motion JSONB, -- Dados do goniômetro
    functional_tests JSONB, -- Resultados dos testes funcionais
    
    -- Diagnóstico e Plano
    clinical_diagnosis TEXT,
    physiotherapy_diagnosis TEXT,
    treatment_goals TEXT[],
    estimated_sessions INTEGER,
    frequency_per_week INTEGER,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE SESSÕES DE TRATAMENTO
CREATE TABLE IF NOT EXISTS treatment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    evaluation_id UUID REFERENCES physiotherapy_evaluations(id) ON DELETE SET NULL,
    
    -- Dados da Sessão
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_number INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Avaliação da Sessão
    pain_scale_before INTEGER CHECK (pain_scale_before >= 0 AND pain_scale_before <= 10),
    pain_scale_after INTEGER CHECK (pain_scale_after >= 0 AND pain_scale_after <= 10),
    
    -- Tratamento Aplicado
    techniques_used TEXT[],
    exercises_performed JSONB, -- Referência aos exercícios
    patient_response TEXT,
    observations TEXT,
    
    -- Evolução
    objective_improvements TEXT,
    patient_feedback TEXT,
    next_session_plan TEXT,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BIBLIOTECA DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS exercise_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações Básicas
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'strengthening', 'stretching', 'mobility', 'balance', etc.
    body_region TEXT[], -- ['cervical', 'lumbar', 'shoulder', 'knee', etc.]
    
    -- Dificuldade e Progressão
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    equipment_needed TEXT[],
    contraindications TEXT[],
    
    -- Parâmetros Padrão
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_hold_time INTEGER, -- em segundos
    default_rest_time INTEGER, -- em segundos
    
    -- Recursos Multimídia
    image_url TEXT,
    video_url TEXT,
    instruction_steps TEXT[],
    
    -- Condições Clínicas
    recommended_conditions TEXT[], -- ['low_back_pain', 'frozen_shoulder', etc.]
    
    -- Metadados
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRESCRIÇÕES DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS exercise_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    prescribed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    evaluation_id UUID REFERENCES physiotherapy_evaluations(id) ON DELETE SET NULL,
    
    -- Dados da Prescrição
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    description TEXT,
    frequency_per_week INTEGER DEFAULT 3,
    duration_weeks INTEGER DEFAULT 4,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'suspended')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ITENS DA PRESCRIÇÃO (EXERCÍCIOS ESPECÍFICOS)
CREATE TABLE IF NOT EXISTS prescription_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES exercise_prescriptions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercise_library(id) ON DELETE CASCADE,
    
    -- Parâmetros Personalizados
    sets INTEGER NOT NULL,
    reps INTEGER,
    hold_time INTEGER, -- em segundos
    rest_time INTEGER, -- em segundos
    
    -- Progressão
    week_start INTEGER DEFAULT 1,
    week_end INTEGER,
    progression_notes TEXT,
    
    -- Ordem na prescrição
    order_index INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EXECUÇÕES DE EXERCÍCIOS (FEEDBACK DO PACIENTE)
CREATE TABLE IF NOT EXISTS exercise_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_exercise_id UUID REFERENCES prescription_exercises(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Dados da Execução
    execution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sets_completed INTEGER,
    reps_completed INTEGER,
    duration_seconds INTEGER,
    
    -- Feedback do Paciente
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    notes TEXT,
    
    -- Localização (se mobile)
    location_type TEXT CHECK (location_type IN ('home', 'clinic', 'gym', 'other')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MEDIÇÕES GONIOMÉTRICAS
CREATE TABLE IF NOT EXISTS goniometry_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    measured_by UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES treatment_sessions(id) ON DELETE SET NULL,
    
    -- Dados da Medição
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    joint TEXT NOT NULL, -- 'shoulder', 'elbow', 'knee', etc.
    movement TEXT NOT NULL, -- 'flexion', 'extension', 'abduction', etc.
    
    -- Valores
    active_rom INTEGER, -- Range of Motion Ativo
    passive_rom INTEGER, -- Range of Motion Passivo
    normal_range_min INTEGER, -- Valor mínimo normal
    normal_range_max INTEGER, -- Valor máximo normal
    
    -- Observações
    pain_during_movement BOOLEAN DEFAULT false,
    resistance_felt BOOLEAN DEFAULT false,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. RESULTADOS DE TESTES FUNCIONAIS
CREATE TABLE IF NOT EXISTS functional_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    tested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES treatment_sessions(id) ON DELETE SET NULL,
    
    -- Dados do Teste
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    test_name TEXT NOT NULL, -- 'lasegue', 'phalen', 'thomas', etc.
    test_category TEXT, -- 'neurological', 'orthopedic', 'muscular'
    
    -- Resultado
    result TEXT NOT NULL CHECK (result IN ('positive', 'negative', 'inconclusive')),
    grade TEXT, -- Para testes graduados
    
    -- Detalhes
    procedure_followed TEXT,
    patient_response TEXT,
    clinical_significance TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. FOTOGRAFIAS DE EVOLUÇÃO
CREATE TABLE IF NOT EXISTS evolution_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    taken_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dados da Foto
    photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL CHECK (category IN ('initial', 'progress', 'final')),
    body_region TEXT, -- 'posture', 'shoulder', 'knee', etc.
    
    -- Arquivo
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size INTEGER,
    
    -- LGPD Compliance
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    purpose TEXT, -- 'clinical_documentation', 'before_after', etc.
    
    -- Visibilidade
    visible_to_patient BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. RELATÓRIOS CLÍNICOS
CREATE TABLE IF NOT EXISTS clinical_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Dados do Relatório
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    report_type TEXT NOT NULL CHECK (report_type IN ('evolution', 'discharge', 'insurance', 'medical')),
    title TEXT NOT NULL,
    
    -- Conteúdo
    content TEXT NOT NULL, -- HTML ou Markdown
    summary TEXT,
    
    -- Período Coberto
    period_start DATE,
    period_end DATE,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'sent')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_physio_evaluations_patient ON physiotherapy_evaluations(patient_id);
CREATE INDEX IF NOT EXISTS idx_physio_evaluations_date ON physiotherapy_evaluations(evaluation_date);

CREATE INDEX IF NOT EXISTS idx_treatment_sessions_patient ON treatment_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_date ON treatment_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_status ON treatment_sessions(status);

CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_active ON exercise_library(is_active);

CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient ON exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_status ON exercise_prescriptions(status);

CREATE INDEX IF NOT EXISTS idx_prescription_exercises_prescription ON prescription_exercises(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_exercises_exercise ON prescription_exercises(exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_executions_patient ON exercise_executions(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_executions_date ON exercise_executions(execution_date);

CREATE INDEX IF NOT EXISTS idx_goniometry_patient ON goniometry_measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_goniometry_joint ON goniometry_measurements(joint);

CREATE INDEX IF NOT EXISTS idx_functional_tests_patient ON functional_test_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_functional_tests_name ON functional_test_results(test_name);

CREATE INDEX IF NOT EXISTS idx_evolution_photos_patient ON evolution_photos(patient_id);
CREATE INDEX IF NOT EXISTS idx_evolution_photos_category ON evolution_photos(category);

CREATE INDEX IF NOT EXISTS idx_clinical_reports_patient ON clinical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reports_type ON clinical_reports(report_type);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_physio_evaluations
    BEFORE UPDATE ON physiotherapy_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_treatment_sessions
    BEFORE UPDATE ON treatment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_exercise_library
    BEFORE UPDATE ON exercise_library
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_exercise_prescriptions
    BEFORE UPDATE ON exercise_prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_clinical_reports
    BEFORE UPDATE ON clinical_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE physiotherapy_evaluations IS 'Avaliações fisioterapêuticas completas com dados clínicos estruturados';
COMMENT ON TABLE treatment_sessions IS 'Registro de cada sessão de fisioterapia com evolução do paciente';
COMMENT ON TABLE exercise_library IS 'Biblioteca completa de exercícios categorizados por especialidade';
COMMENT ON TABLE exercise_prescriptions IS 'Prescrições de exercícios personalizadas para pacientes';
COMMENT ON TABLE prescription_exercises IS 'Exercícios específicos dentro de uma prescrição com parâmetros';
COMMENT ON TABLE exercise_executions IS 'Feedback dos pacientes sobre execução dos exercícios';
COMMENT ON TABLE goniometry_measurements IS 'Medições goniométricas para acompanhamento de amplitude';
COMMENT ON TABLE functional_test_results IS 'Resultados de testes funcionais padronizados';
COMMENT ON TABLE evolution_photos IS 'Fotografias para documentação visual da evolução (LGPD compliant)';
COMMENT ON TABLE clinical_reports IS 'Relatórios clínicos estruturados para diferentes finalidades'; 