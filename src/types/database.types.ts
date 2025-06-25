export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'fisioterapeuta' | 'estagiario'
          crefito?: string
          phone?: string
          avatar_url?: string
          is_active: boolean
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'admin' | 'fisioterapeuta' | 'estagiario'
          crefito?: string
          phone?: string
          avatar_url?: string
          is_active?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'fisioterapeuta' | 'estagiario'
          crefito?: string
          phone?: string
          avatar_url?: string
          is_active?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      notebooks: {
        Row: {
          id: string
          title: string
          description?: string
          icon?: string
          color?: string
          owner_id: string
          is_public: boolean
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          icon?: string
          color?: string
          owner_id: string
          is_public?: boolean
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          color?: string
          owner_id?: string
          is_public?: boolean
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          notebook_id: string
          parent_page_id?: string
          title: string
          content: Json
          emoji?: string
          cover_image?: string
          is_template: boolean
          template_category?: string
          permissions: Json
          version: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          notebook_id: string
          parent_page_id?: string
          title: string
          content?: Json
          emoji?: string
          cover_image?: string
          is_template?: boolean
          template_category?: string
          permissions?: Json
          version?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          notebook_id?: string
          parent_page_id?: string
          title?: string
          content?: Json
          emoji?: string
          cover_image?: string
          is_template?: boolean
          template_category?: string
          permissions?: Json
          version?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description?: string
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          owner_id: string
          notebook_id?: string
          start_date?: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          progress: number
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          owner_id: string
          notebook_id?: string
          start_date?: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          progress?: number
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          owner_id?: string
          notebook_id?: string
          start_date?: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          progress?: number
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          parent_task_id?: string
          title: string
          description?: string
          status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string
          created_by: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          checklist_items: Json
          tags: string[]
          position: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          parent_task_id?: string
          title: string
          description?: string
          status?: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string
          created_by: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          checklist_items?: Json
          tags?: string[]
          position?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          parent_task_id?: string
          title?: string
          description?: string
          status?: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string
          created_by?: string
          due_date?: string
          estimated_hours?: number
          actual_hours?: number
          checklist_items?: Json
          tags?: string[]
          position?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_id: string
          target_type: 'page' | 'task' | 'project'
          target_id: string
          parent_comment_id?: string
          mentions: string[]
          reactions: Json
          is_resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          target_type: 'page' | 'task' | 'project'
          target_id: string
          parent_comment_id?: string
          mentions?: string[]
          reactions?: Json
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          target_type?: 'page' | 'task' | 'project'
          target_id?: string
          parent_comment_id?: string
          mentions?: string[]
          reactions?: Json
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      mentorships: {
        Row: {
          id: string
          mentor_id: string
          mentee_id: string
          start_date: string
          end_date?: string
          goals: string[]
          competencies: Json
          progress_notes: Json
          evaluations: Json
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          mentee_id: string
          start_date: string
          end_date?: string
          goals?: string[]
          competencies?: Json
          progress_notes?: Json
          evaluations?: Json
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          mentee_id?: string
          start_date?: string
          end_date?: string
          goals?: string[]
          competencies?: Json
          progress_notes?: Json
          evaluations?: Json
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id?: string
          old_values?: Json
          new_values?: Json
          metadata: Json
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id?: string
          old_values?: Json
          new_values?: Json
          metadata?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          old_values?: Json
          new_values?: Json
          metadata?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'fisioterapeuta' | 'estagiario'
      project_status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
      task_status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
      priority_level: 'low' | 'medium' | 'high' | 'urgent'
      comment_target_type: 'page' | 'task' | 'project'
      mentorship_status: 'active' | 'completed' | 'paused'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never