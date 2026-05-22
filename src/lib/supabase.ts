import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tivlznrjwtdtjmmfrczo.supabase.co";
// Publishable (anon) key — safe to expose. Row Level Security policies enforce access.
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdmx6bnJqd3RkdGptbWZyY3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjkxMjcsImV4cCI6MjA5MTkwNTEyN30.SK0dFcqwhZ75N3uUGR1Qwy6MmoPYbowFgCarC5k4GF0";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      detectSessionInUrl: typeof window !== "undefined",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "bharatone-auth",
    },
  });
  return _client;
}

// Shape of a row in bharatone_contact_submissions
export type ContactSubmission = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  topic: "services" | "center" | "partnership" | "media" | "other";
  message: string;
  status: "new" | "in_progress" | "resolved" | "spam";
  responded_at: string | null;
  notes: string | null;
  source: string | null;
};

export type SubmissionStatus = ContactSubmission["status"];
