import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://kfiqrymeyvjtqsohtecu.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaXFyeW1leXZqdHFzb2h0ZWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTU1MzIsImV4cCI6MjA3NDUzMTUzMn0.diSzVX7L8wf-zmK0Tz5dWuaeYDKCwV55_7YVVaCNZ5g";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          username?: string;
          email: string;
          college: string;
          branch: string;
          year: number;
          bio: string | null;
          avatar_url: string | null;
          skills: string[] | null;
          achievements: string[] | null;
          is_verified: boolean;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          username?: string;
          email: string;
          college: string;
          branch: string;
          year: number;
          bio?: string | null;
          avatar_url?: string | null;
          skills?: string[] | null;
          achievements?: string[] | null;
          is_verified?: boolean;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          username?: string;
          email?: string;
          college?: string;
          branch?: string;
          year?: number;
          bio?: string | null;
          avatar_url?: string | null;
          skills?: string[] | null;
          achievements?: string[] | null;
          is_verified?: boolean;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          file_url: string | null;
          file_name: string | null;
          file_type: string | null;
          is_anonymous: boolean;
          scope: "college" | "global";
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          is_anonymous?: boolean;
          scope?: "college" | "global";
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          file_url?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          is_anonymous?: boolean;
          scope?: "college" | "global";
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          title: string;
          resume_data: Record<string, unknown>;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          title: string;
          resume_data: Record<string, unknown>;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          title?: string;
          resume_data?: Record<string, unknown>;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      resume_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          template_data: Record<string, unknown>;
          preview_url: string | null;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          template_data: Record<string, unknown>;
          preview_url?: string | null;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          template_data?: Record<string, unknown>;
          preview_url?: string | null;
          is_premium?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
