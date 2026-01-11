
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Client, Visit, Reminder } from './types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Funciones de utilidad para mapear entre JS (camelCase) y DB (snake_case)
const mapClientToDB = (client: Partial<Client>) => ({
  name: client.name,
  contact_person: client.contactPerson,
  phone: client.phone,
  email: client.email,
  address: client.address,
  city: client.city,
  notes: client.notes
});

const mapDBToClient = (db: any): Client => ({
  id: db.id,
  name: db.name,
  contactPerson: db.contact_person,
  phone: db.phone,
  email: db.email,
  address: db.address,
  city: db.city,
  notes: db.notes,
  createdAt: db.created_at
});

const mapVisitToDB = (visit: Partial<Visit>) => ({
  client_id: visit.clientId,
  date: visit.date,
  type: visit.type,
  result: visit.result,
  notes: visit.notes,
  follow_up_date: visit.followUpDate
});

const mapDBToVisit = (db: any): Visit => ({
  id: db.id,
  clientId: db.client_id,
  date: db.date,
  type: db.type,
  result: db.result,
  notes: db.notes,
  followUpDate: db.follow_up_date
});

const mapReminderToDB = (reminder: Partial<Reminder>) => ({
  client_id: reminder.clientId,
  title: reminder.title,
  date: reminder.date,
  completed: reminder.completed
});

const mapDBToReminder = (db: any): Reminder => ({
  id: db.id,
  clientId: db.client_id,
  title: db.title,
  date: db.date,
  completed: db.completed
});

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
    if (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
    return (data || []).map(mapDBToClient);
  },
  
  saveClient: async (client: Partial<Client>) => {
    if (!supabase) throw new Error("Base de datos no conectada.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado.");

    const dbData = { ...mapClientToDB(client), user_id: user.id };

    if (client.id) {
      const { error } = await supabase.from('clients').update(dbData).eq('id', client.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('clients').insert([dbData]);
      if (error) throw error;
    }
  },

  deleteClient: async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  getVisits: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('visits').select('*').order('date', { ascending: false });
    if (error) return [];
    return (data || []).map(mapDBToVisit);
  },

  saveVisit: async (visit: Partial<Visit>) => {
    if (!supabase) throw new Error("Base de datos no conectada.");
    const { data: { user } } = await supabase.auth.getUser();
    const dbData = { ...mapVisitToDB(visit), user_id: user?.id };
    const { error } = await supabase.from('visits').insert([dbData]);
    if (error) throw error;
  },

  getReminders: async () => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('reminders').select('*').order('date');
    if (error) return [];
    return (data || []).map(mapDBToReminder);
  },

  saveReminder: async (reminder: Partial<Reminder>) => {
    if (!supabase) throw new Error("Base de datos no conectada.");
    const { data: { user } } = await supabase.auth.getUser();
    const dbData = { ...mapReminderToDB(reminder), user_id: user?.id };
    const { error } = await supabase.from('reminders').insert([dbData]);
    if (error) throw error;
  },

  updateReminder: async (id: string, updates: Partial<Reminder>) => {
    if (!supabase) return;
    const { error } = await supabase.from('reminders').update(mapReminderToDB(updates)).eq('id', id);
    if (error) throw error;
  },

  deleteReminder: async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) throw error;
  }
};
