import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  privy_id?: string
  region?: string
  total_earnings: number
  created_at: string
  updated_at: string
}

export interface TrainingSubmission {
  id: string
  user_id: string
  story_id?: number
  original_text: string
  corrected_text: string
  audio_url?: string
  region?: string
  earnings: number
  submitted_at: string
}

// Storage bucket name for audio files
export const AUDIO_BUCKET = 'audio-submissions'

