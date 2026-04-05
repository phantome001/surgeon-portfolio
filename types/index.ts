export type { Database, UserRole, AppointmentStatus, AuditAction, Json } from './database'

export interface UserProfile {
  id: string
  name: string
  role: 'patient' | 'doctor'
  email: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  content: string
  sent_at: string
  read_at: string | null
}

export interface VideoCategory {
  id: string
  slug: string
  name_ar: string
  name_fr: string
  emoji: string
  sort_order: number
  video_count?: number
}

export interface Video {
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
}

export interface DecryptedAppointment {
  id: string
  user_id: string
  date: string
  time_slot: string
  full_name: string
  phone: string
  reason: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  doctor_notes: string | null
  created_at: string
}

export type Language = 'ar' | 'fr'
