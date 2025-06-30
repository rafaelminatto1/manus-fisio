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
// Note: Exercise type is intentionally omitted as the table is not in the initial schema 