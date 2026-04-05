export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'patient' | 'doctor'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'account_locked'
  | 'appointment_created'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'message_sent'
  | 'video_viewed'
  | 'admin_action'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          phone_encrypted: string | null
          role: UserRole
          failed_attempts: number
          locked_until: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          phone_encrypted?: string | null
          role?: UserRole
          failed_attempts?: number
          locked_until?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_encrypted?: string | null
          role?: UserRole
          failed_attempts?: number
          locked_until?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      video_categories: {
        Row: {
          id: string
          slug: string
          name_ar: string
          name_fr: string
          emoji: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_ar: string
          name_fr: string
          emoji: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_ar?: string
          name_fr?: string
          emoji?: string
          sort_order?: number
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          category_id: string
          title_ar: string
          title_fr: string
          desc_ar: string
          desc_fr: string
          embed_url: string
          duration: string
          views: number
          is_published: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          title_ar: string
          title_fr: string
          desc_ar: string
          desc_fr: string
          embed_url: string
          duration: string
          views?: number
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          title_ar?: string
          title_fr?: string
          desc_ar?: string
          desc_fr?: string
          embed_url?: string
          duration?: string
          views?: number
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          date: string
          time_slot: string
          full_name_encrypted: string
          phone_encrypted: string
          reason_encrypted: string
          status: AppointmentStatus
          doctor_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time_slot: string
          full_name_encrypted: string
          phone_encrypted: string
          reason_encrypted: string
          status?: AppointmentStatus
          doctor_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          time_slot?: string
          full_name_encrypted?: string
          phone_encrypted?: string
          reason_encrypted?: string
          status?: AppointmentStatus
          doctor_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          patient_id: string
          ai_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          ai_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          ai_enabled?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content_encrypted: string
          sent_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content_encrypted: string
          sent_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content_encrypted?: string
          sent_at?: string
          read_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: AuditAction
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: AuditAction
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: AuditAction
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Functions: {
      get_my_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      is_doctor: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_slot_available: {
        Args: { p_date: string; p_time_slot: string }
        Returns: boolean
      }
    }
  }
}
