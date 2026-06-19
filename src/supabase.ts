import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vwawxiptmpvmopgodzta.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3YXd4aXB0bXB2bW9wZ29kenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MjUwMDUsImV4cCI6MjA5NzQwMTAwNX0.qoDG0dENrLSYzSY_hPuL0VSiq05aE768ooIk_qbNGPk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
