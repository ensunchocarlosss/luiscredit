import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dkxfmzbkavonwvexhjik.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreGZtemJrYXZvbnd2ZXhoamlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMjM5NzcsImV4cCI6MjA5ODU5OTk3N30.YNOZvrDY8awVZzSqzMK5fa-3Cdg4-_AK4KFG6bkZ0Vo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
