import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfkyzbbwpvcvvwuhrgct.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma3l6YmJ3cHZjdnZ3dWhyZ2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTIxMTksImV4cCI6MjA3MjE2ODExOX0.p3i2sTtnfxpy_WUckplwLEiXRI6R4L03xh0lLuv9bn0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
