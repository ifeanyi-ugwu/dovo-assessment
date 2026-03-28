import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    // Server-side: no session storage or token refresh
    persistSession: false,
    autoRefreshToken: false,
  },
})
