import { createClient } from '@supabase/supabase-js';

// We use placeholder values to ensure the app compiles and renders the UI in preview mode
// before the user provisions their actual Supabase project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'owner' | 'manager' | 'sales' | 'delivery' | 'accountant';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}
