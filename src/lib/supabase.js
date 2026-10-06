import { createClient } from '@supabase/supabase-js'

const productionFallbackUrl = 'https://dkxfmzbkavonwvexhjik.supabase.co'
const productionFallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreGZtemJrYXZvbnd2ZXhoamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjM5NzcsImV4cCI6MjA5ODU5OTk3N30.YNOZvrDY8awVZzSqzMK5fa-3Cdg4-_AK4KFG6bkZ0Vo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Crea un archivo .env.local en la raíz del proyecto.')
}

export const supabase = createClient(
  supabaseUrl || productionFallbackUrl,
  supabaseAnonKey || productionFallbackKey
)
