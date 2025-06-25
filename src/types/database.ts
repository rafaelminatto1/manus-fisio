// Tipos de banco de dados para o Sistema de Gestão Clínica

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          profile_image_url?: string;
          created_at: string;
          updated_at: string;
          last_login?: string;
          is_active: boolean;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: UserRole;
          profile_image_url?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          is_active?: boolean;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          profile_image_url?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
          is_active?: boolean;
          metadata?: Record<string, any>;
        };
      };
      notebooks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          icon?: string;
          color?: string;
          owner_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          icon?: string;
          color?: string;
          owner_id: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string;
          color?: string;
          owner_id?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      pages: {
        Row: {
          id: string;
          notebook_id: string;
          parent_page_id?: string;
          title: string;
          content?: string;
          template_type?: TemplateType;
          order_index: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          last_edited_by?: string;
          version: number;
          is_published: boolean;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          notebook_id: string;
          parent_page_id?: string;
          title: string;
          content?: string;
          template_type?: TemplateType;
          order_index?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          last_edited_by?: string;
          version?: number;
          is_published?: boolean;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          notebook_id?: string;
          parent_page_id?: string;
          title?: string;
          content?: string;
          template_type?: TemplateType;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          last_edited_by?: string;
          version?: number;
          is_published?: boolean;
          metadata?: Record<string, any>;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description?: string;
          status: ProjectStatus;
          priority: Priority;
          owner_id: string;
          due_date?: string;
          start_date?: string;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status?: ProjectStatus;
          priority?: Priority;
          owner_id: string;
          due_date?: string;
          start_date?: string;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: ProjectStatus;
          priority?: Priority;
          owner_id?: string;
          due_date?: string;
          start_date?: string;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          parent_task_id?: string;
          title: string;
          description?: string;
          status: TaskStatus;
          priority: Priority;
          assignee_id?: string;
          due_date?: string;
          completed_at?: string;
          estimated_hours?: number;
          actual_hours?: number;
          order_index: number;
          created_by: string;
          created_at: string;
          updated_at: string;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          project_id: string;
          parent_task_id?: string;
          title: string;
          description?: string;
          status?: TaskStatus;
          priority?: Priority;
          assignee_id?: string;
          due_date?: string;
          completed_at?: string;
          estimated_hours?: number;
          actual_hours?: number;
          order_index?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          project_id?: string;
          parent_task_id?: string;
          title?: string;
          description?: string;
          status?: TaskStatus;
          priority?: Priority;
          assignee_id?: string;
          due_date?: string;
          completed_at?: string;
          estimated_hours?: number;
          actual_hours?: number;
          order_index?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          author_id: string;
          target_type: CommentTargetType;
          target_id: string;
          parent_comment_id?: string;
          created_at: string;
          updated_at: string;
          is_resolved: boolean;
          mentions: string[];
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          content: string;
          author_id: string;
          target_type: CommentTargetType;
          target_id: string;
          parent_comment_id?: string;
          created_at?: string;
          updated_at?: string;
          is_resolved?: boolean;
          mentions?: string[];
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string;
          target_type?: CommentTargetType;
          target_id?: string;
          parent_comment_id?: string;
          created_at?: string;
          updated_at?: string;
          is_resolved?: boolean;
          mentions?: string[];
          metadata?: Record<string, any>;
        };
      };
      mentorships: {
        Row: {
          id: string;
          mentor_id: string;
          mentee_id: string;
          status: MentorshipStatus;
          start_date: string;
          end_date?: string;
          goals: string[];
          competencies: Competency[];
          created_at: string;
          updated_at: string;
          metadata?: Record<string, any>;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          mentee_id: string;
          status?: MentorshipStatus;
          start_date: string;
          end_date?: string;
          goals?: string[];
          competencies?: Competency[];
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          mentee_id?: string;
          status?: MentorshipStatus;
          start_date?: string;
          end_date?: string;
          goals?: string[];
          competencies?: Competency[];
          created_at?: string;
          updated_at?: string;
          metadata?: Record<string, any>;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: ActivityAction;
          resource_type: ResourceType;
          resource_id: string;
          metadata?: Record<string, any>;
          ip_address?: string;
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: ActivityAction;
          resource_type: ResourceType;
          resource_id: string;
          metadata?: Record<string, any>;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: ActivityAction;
          resource_type?: ResourceType;
          resource_id?: string;
          metadata?: Record<string, any>;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      priority: Priority;
      template_type: TemplateType;
      comment_target_type: CommentTargetType;
      mentorship_status: MentorshipStatus;
      activity_action: ActivityAction;
      resource_type: ResourceType;
    };
  };
}

// Enums
export enum UserRole {
  ADMIN = 'admin',
  FISIOTERAPEUTA = 'fisioterapeuta',
  ESTAGIARIO = 'estagiario'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TemplateType {
  PROTOCOL = 'protocol',
  EVALUATION = 'evaluation',
  TREATMENT_PLAN = 'treatment_plan',
  PROGRESS_REPORT = 'progress_report',
  PROCEDURE = 'procedure',
  GENERAL = 'general'
}

export enum CommentTargetType {
  PAGE = 'page',
  TASK = 'task',
  PROJECT = 'project'
}

export enum MentorshipStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

export enum ActivityAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export enum ResourceType {
  USER = 'user',
  NOTEBOOK = 'notebook',
  PAGE = 'page',
  PROJECT = 'project',
  TASK = 'task',
  COMMENT = 'comment',
  MENTORSHIP = 'mentorship'
}

// Interfaces auxiliares
export interface Competency {
  id: string;
  name: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  achieved: boolean;
  achieved_at?: string;
  evidence?: string[];
}

// Tipos de domínio
export type User = Database['public']['Tables']['users']['Row'];
export type Notebook = Database['public']['Tables']['notebooks']['Row'];
export type Page = Database['public']['Tables']['pages']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Mentorship = Database['public']['Tables']['mentorships']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

// Tipos para inserção
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type NotebookInsert = Database['public']['Tables']['notebooks']['Insert'];
export type PageInsert = Database['public']['Tables']['pages']['Insert'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type MentorshipInsert = Database['public']['Tables']['mentorships']['Insert'];
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert'];

// Tipos para atualização
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type NotebookUpdate = Database['public']['Tables']['notebooks']['Update'];
export type PageUpdate = Database['public']['Tables']['pages']['Update'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];
export type MentorshipUpdate = Database['public']['Tables']['mentorships']['Update'];
export type ActivityLogUpdate = Database['public']['Tables']['activity_logs']['Update']; 