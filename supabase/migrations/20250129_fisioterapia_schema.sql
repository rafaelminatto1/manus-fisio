-- MANUS FISIO - SCHEMA COMPLETO DE FISIOTERAPIA
-- Data: 29/01/2025

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
    muscle_strength JSONB,
    range_of_motion JSONB,
    functional_tests JSONB,
    
    -- Diagnóstico e Plano
    clinical_diagnosis TEXT,
    physiotherapy_diagnosis TEXT,
    treatment_goals TEXT[],
    estimated_sessions INTEGER,
    frequency_per_week INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BIBLIOTECA DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS exercise_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    body_region TEXT[],
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    equipment_needed TEXT[],
    contraindications TEXT[],
    default_sets INTEGER DEFAULT 3,
    default_reps INTEGER DEFAULT 10,
    default_hold_time INTEGER,
    image_url TEXT,
    video_url TEXT,
    instruction_steps TEXT[],
    recommended_conditions TEXT[],
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRESCRIÇÕES DE EXERCÍCIOS
CREATE TABLE IF NOT EXISTS exercise_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    prescribed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    evaluation_id UUID REFERENCES physiotherapy_evaluations(id) ON DELETE SET NULL,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    description TEXT,
    frequency_per_week INTEGER DEFAULT 3,
    duration_weeks INTEGER DEFAULT 4,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_physio_evaluations_patient ON physiotherapy_evaluations(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient ON exercise_prescriptions(patient_id); 