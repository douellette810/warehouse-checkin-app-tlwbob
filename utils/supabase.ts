
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          address: string;
          contact_person: string;
          email: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          contact_person: string;
          email: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      value_materials: {
        Row: {
          id: string;
          name: string;
          measurement: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          measurement: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          measurement?: string;
          created_at?: string;
        };
      };
      charge_materials: {
        Row: {
          id: string;
          name: string;
          measurement: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          measurement: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          measurement?: string;
          created_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          employee_name: string;
          date: string;
          time: string;
          total_time: string;
          company_id: string;
          company_name: string;
          address: string;
          contact_person: string;
          email: string;
          phone: string;
          categories: any;
          value_materials: any;
          charge_materials: any;
          suspected_value_note: string | null;
          other_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_name: string;
          date: string;
          time: string;
          total_time: string;
          company_id: string;
          company_name: string;
          address: string;
          contact_person: string;
          email: string;
          phone: string;
          categories: any;
          value_materials: any;
          charge_materials: any;
          suspected_value_note?: string | null;
          other_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_name?: string;
          date?: string;
          time?: string;
          total_time?: string;
          company_id?: string;
          company_name?: string;
          address?: string;
          contact_person?: string;
          email?: string;
          phone?: string;
          categories?: any;
          value_materials?: any;
          charge_materials?: any;
          suspected_value_note?: string | null;
          other_notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
