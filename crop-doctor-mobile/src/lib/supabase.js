import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wicnluuikqdgkcnxtvcj.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpY25sdXVpa3FkZ2tjbnh0dmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDQ5NzksImV4cCI6MjEwMTA4MDk3OX0._Oq6831yQrMtLI9V5xBEEqQJkKLNi5V76hKm5MidNio';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
