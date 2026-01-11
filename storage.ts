

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client, Visit, Reminder } from './types';

// En Vite, las variables deben empezar por VITE_ y se acceden por import.meta.env
// Fix: Use type assertion for import.meta to bypass TypeScript property 'env' does not exist error.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
// Fix: Use type assertion for import.meta to bypass TypeScript property 'env' does not exist error.
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("GietCRM: Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
}

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const storage = {
  isConfigured: () => !!supabase,

  getAuth: async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  },
  
  signIn: async (email: string, pass: string) => {
    if (!supabase) throw new Error("Supabase no configurado.");
    return await supabase.auth.signInWithPassword({ email, password: pass });
  },

  logout: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  getClients: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error) return [];
    return (data as Client[]) || [];
  },
  
  saveClient: async (client: Partial<Client>) => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (client.id) {
      return await supabase.from('clients').update(client).eq('id', client.id);
    }
    return await supabase.from('clients').insert([{ ...client, user_id: user?.id }]);
  },

  deleteClient: async (id: string) => {
    if (!supabase) return;
    return await supabase.from('clients').delete().eq('id', id);
  },

  getVisits: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('visits').select('*').order('date', { ascending: false });
    if (error) return [];
    return (data as Visit[]) || [];
  },

  saveVisit: async (visit: Partial<Visit>) => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from('visits').insert([{ ...visit, user_id: user?.id }]);
  },

  getReminders: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('reminders').select('*').order('date');
    if (error) return [];
    return (data as Reminder[]) || [];
  },

  saveReminder: async (reminder: Partial<Reminder>) => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase.from('reminders').insert([{ ...reminder, user_id: user?.id }]);
  },

  updateReminder: async (id: string, updates: Partial<Reminder>) => {
    if (!supabase) return;
    return await supabase.from('reminders').update(updates).eq('id', id);
  },

  deleteReminder: async (id: string) => {
    if (!supabase) return;
    return await supabase.from('reminders').delete().eq('id', id);
  }
};
