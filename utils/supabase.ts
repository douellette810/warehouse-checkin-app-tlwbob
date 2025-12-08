
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = "https://odxarwotboebqodpqdjy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keGFyd290Ym9lYnFvZHBxZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjQ3NTcsImV4cCI6MjA4MDgwMDc1N30.z1Tv73tV5zf-PiR4B3BICk6_uHJkKXlKbFA9ylwzBSk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
