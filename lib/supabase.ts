import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

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

// Database types
export interface User {
  id: string
  username: string
  role: 'Contabilidad' | 'Coordinación' | 'Estrategia' | 'Dirección'
  area: string
  avatar_url?: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string
  created_by: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  start_date?: string
  due_date?: string
  completed_at?: string
  area: string
  tags: string[]
  attachments: string[]
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  mentions: string[]
  parent_id?: string
  created_at: string
}

export interface KPI {
  id: string
  name: string
  description: string
  type: 'manual' | 'calculated'
  category: string
  target_value: number
  current_value: number
  period: 'weekly' | 'monthly' | 'quarterly'
  unit: string
  threshold_warning: number
  area: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: 'task' | 'kpi' | 'comment'
  entity_id: string
  details: any
  created_at: string
}