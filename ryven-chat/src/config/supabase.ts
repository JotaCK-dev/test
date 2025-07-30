import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kkgnfmflshnagjizdnva.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZ25mbWZsc2huYWdqaXpkbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NzEyOTUsImV4cCI6MjA2OTI0NzI5NX0.C_sc_d0peqIvjJNDbOgqPMduQ8JDrVcy39P59qMP_6E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types for our database
export interface Profile {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  name: string
  type: 'global' | 'ai'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  user_id: string | null
  content: string | null
  image_url: string | null
  is_ai: boolean
  ai_participants: string[] | null
  created_at: string
  updated_at: string
  is_edited: boolean
  is_deleted: boolean
  profiles?: Profile
}

export interface ChatParticipant {
  id: string
  chat_id: string
  user_id: string
  joined_at: string
  profiles?: Profile
}