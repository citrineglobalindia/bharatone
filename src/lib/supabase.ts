import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tivlznrjwtdtjmmfrczo.supabase.co";
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
  user_agent: string | null;
};

export type SubmissionStatus = ContactSubmission["status"];

export type Visit = {
  id: string;
  created_at: string;
  session_id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  screen: string | null;
  language: string | null;
  country: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export type ChatbotMessage = {
  id: string;
  created_at: string;
  session_id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  page_path: string | null;
  user_agent: string | null;
};


export type JobApplicationStatus =
  | "new" | "reviewing" | "shortlisted" | "interview" | "offered" | "rejected" | "withdrawn";

export type JobApplication = {
  id: string;
  created_at: string;
  job_id: string;
  job_title: string;
  job_team: string | null;
  full_name: string;
  email: string;
  phone: string;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  resume_filename: string | null;
  total_experience_years: number | null;
  current_position: string | null;
  current_company: string | null;
  experience: string | null;
  education: string | null;
  cover_letter: string | null;
  status: JobApplicationStatus;
  notes: string | null;
  reviewed_at: string | null;
  source: string | null;
  user_agent: string | null;
};


export type NewsletterSubscriber = {
  id: string;
  created_at: string;
  email: string;
  status: "subscribed" | "unsubscribed" | "bounced";
  source: string | null;
  user_agent: string | null;
  ip_hint: string | null;
};
