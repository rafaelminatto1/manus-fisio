export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'admin' | 'mentor' | 'intern' | 'guest'
          crefito: string | null
          specialty: string | null
          university: string | null
          semester: number | null
          created_at: string
          updated_at: string
        }
        Insert: { /* ... */ }
        Update: { /* ... */ }
        Relationships: [ /* ... */ ]
      },
      // ... Add all other tables from initial_schema.sql here
      // projects, tasks, patients, etc.
      projects: {
        Row: {
            id: string,
            title: string,
            description: string | null,
            status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled',
            priority: 'low' | 'medium' | 'high' | 'urgent',
            due_date: string | null,
            progress: number,
            created_by: string,
            created_at: string,
            updated_at: string
        },
        Insert: { /* ... */ },
        Update: { /* ... */ },
        Relationships: [ /* ... */ ]
      },
      tasks: {
        Row: {
            id: string;
            project_id: string;
            title: string;
            description: string | null;
            status: "todo" | "in_progress" | "review" | "done";
            priority: "low" | "medium" | "high" | "urgent";
            assigned_to: string | null;
            due_date: string | null;
            created_at: string;
            updated_at: string;
            order_index?: number;
        },
        Insert: { /* ... */ },
        Update: { /* ... */ },
        Relationships: [ /* ... */ ]
      },
      patients: {
          Row: {
              id: string;
              full_name: string;
              email: string | null;
              phone: string | null;
              birth_date: string | null;
              created_at: string | null;
              address: string | null;
              cpf: string | null;
              emergency_contact_name: string | null;
              emergency_contact_phone: string | null;
              gender: string | null;
              initial_medical_history: string | null;
              updated_at: string | null;
              created_by: string | null;
          };
          Insert: { /* ... */ };
          Update: { /* ... */ };
          Relationships: [/* ... */];
      },
      physiotherapy_evaluations: {
          Row: {
              id: string;
              patient_id: string;
              evaluator_id: string | null;
              evaluation_date: string;
              main_complaint: string;
              pain_scale_initial: number | null;
              pain_location: string | null;
              pain_characteristics: string | null;
              medical_history: string | null;
              previous_treatments: string | null;
              medications: string | null;
              lifestyle_factors: string | null;
              posture_analysis: string | null;
              muscle_strength: Json | null;
              range_of_motion: Json | null;
              functional_tests: Json | null;
              clinical_diagnosis: string | null;
              physiotherapy_diagnosis: string | null;
              treatment_goals: string[] | null;
              estimated_sessions: number | null;
              frequency_per_week: number | null;
              created_at: string;
              updated_at: string;
          };
          Insert: { /* ... */ };
          Update: { /* ... */ };
          Relationships: [/* ... */];
      },
      exercise_library: {
          Row: {
              id: string;
              name: string;
              description: string | null;
              category: string;
              body_region: string[] | null;
              difficulty_level: number | null;
              equipment_needed: string[] | null;
              contraindications: string[] | null;
              default_sets: number | null;
              default_reps: number | null;
              default_hold_time: number | null;
              image_url: string | null;
              video_url: string | null;
              instruction_steps: string[] | null;
              recommended_conditions: string[] | null;
              created_by: string | null;
              is_active: boolean | null;
              created_at: string;
              updated_at: string;
          };
          Insert: { /* ... */ };
          Update: { /* ... */ };
          Relationships: [/* ... */];
      },
      exercise_prescriptions: {
          Row: {
              id: string;
              patient_id: string;
              prescribed_by: string | null;
              evaluation_id: string | null;
              prescription_date: string;
              title: string;
              description: string | null;
              frequency_per_week: number | null;
              duration_weeks: number | null;
              status: 'draft' | 'active' | 'completed' | 'suspended';
              created_at: string;
              updated_at: string;
          };
          Insert: { /* ... */ };
          Update: { /* ... */ };
          Relationships: [/* ... */];
      }
      // ... and so on for all tables
    }
    Enums: {
      user_role: 'admin' | 'mentor' | 'intern' | 'guest'
      project_status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
      task_status: 'todo' | 'in_progress' | 'review' | 'done'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      mentorship_status: 'active' | 'completed' | 'suspended'
    }
    // ...
  }
}

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};
export type Project = Database['public']['Tables']['projects']['Row'];
export type Patient = Database['public']['Tables']['patients']['Row'];
export type UserProfile = Database['public']['Tables']['users']['Row'];

// Fisioterapia Types
export type PhysiotherapyEvaluation = Database['public']['Tables']['physiotherapy_evaluations']['Row'];
export type ExerciseLibrary = Database['public']['Tables']['exercise_library']['Row'];
export type ExercisePrescription = Database['public']['Tables']['exercise_prescriptions']['Row'];

// Extended types for frontend
export type PatientWithEvaluations = Patient & {
  evaluations?: PhysiotherapyEvaluation[];
  prescriptions?: ExercisePrescription[];
};

export type ExerciseWithPrescription = ExerciseLibrary & {
  prescription_exercises?: {
    sets: number;
    reps: number;
    hold_time: number;
    rest_time: number;
  };
}; 