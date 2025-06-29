-- Tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category VARCHAR(80),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    video_url VARCHAR(255),
    muscle_group VARCHAR(100),
    duration_minutes INTEGER,
    repetitions INTEGER,
    sets INTEGER,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prescrições de exercícios
CREATE TABLE IF NOT EXISTS exercise_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    prescribed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prescription_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    observations TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
    prescribed_sets INTEGER,
    prescribed_repetitions INTEGER,
    prescribed_duration_minutes INTEGER,
    frequency_per_week INTEGER DEFAULT 3,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de execuções/feedback dos exercícios
CREATE TABLE IF NOT EXISTS exercise_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES exercise_prescriptions(id) ON DELETE CASCADE,
    execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_sets INTEGER,
    completed_repetitions INTEGER,
    completed_duration_minutes INTEGER,
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    patient_feedback TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_patient ON exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_prescriptions_status ON exercise_prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_exercise_executions_prescription ON exercise_executions(prescription_id);
CREATE INDEX IF NOT EXISTS idx_exercise_executions_date ON exercise_executions(execution_date);

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_executions ENABLE ROW LEVEL SECURITY;

-- Política para exercises: todos os usuários logados podem ver
CREATE POLICY "Users can view exercises" ON exercises
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para exercises: apenas admins e mentors podem criar/editar
CREATE POLICY "Admins and mentors can manage exercises" ON exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'mentor')
        )
    );

-- Política para exercise_prescriptions: usuários podem ver suas próprias prescrições
CREATE POLICY "Users can view their prescriptions" ON exercise_prescriptions
    FOR SELECT USING (
        prescribed_by = auth.uid() OR 
        patient_id IN (
            SELECT id FROM patients WHERE id = patient_id
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'mentor')
        )
    );

-- Política para exercise_prescriptions: apenas mentors podem prescrever
CREATE POLICY "Mentors can manage prescriptions" ON exercise_prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'mentor')
        )
    );

-- Política para exercise_executions: usuários podem ver execuções relacionadas às suas prescrições
CREATE POLICY "Users can view related executions" ON exercise_executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exercise_prescriptions ep
            WHERE ep.id = prescription_id
            AND (ep.prescribed_by = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM users 
                     WHERE id = auth.uid() 
                     AND role IN ('admin', 'mentor')
                 ))
        )
    );

-- Política para exercise_executions: pacientes podem registrar suas execuções
CREATE POLICY "Patients can record executions" ON exercise_executions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM exercise_prescriptions ep
            JOIN patients p ON p.id = ep.patient_id
            WHERE ep.id = prescription_id
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_prescriptions_updated_at BEFORE UPDATE ON exercise_prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 