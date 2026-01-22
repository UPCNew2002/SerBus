import { createClient } from '@supabase/supabase-js'
 
const SUPABASE_URL = 'https://uzkznawepjnmmbenhvbb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a3puYXdlcGpubW1iZW5odmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NjUwNzMsImV4cCI6MjA4NDI0MTA3M30.vz20XqapuW6xQrdRryqEjw2qx5u0Wygqm4HRM_P2h0M'
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)