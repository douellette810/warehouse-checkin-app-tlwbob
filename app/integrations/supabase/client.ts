import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://odxarwotboebqodpqdjy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keGFyd290Ym9lYnFvZHBxZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjQ3NTcsImV4cCI6MjA4MDgwMDc1N30.z1Tv73tV5zf-PiR4B3BICk6_uHJkKXlKbFA9ylwzBSk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
