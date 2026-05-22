import { getSupabase } from "./supabase";

const SESSION_KEY = "bharatone-session-id";
const CONVO_KEY = "bharatone-chat-convo";

/** Stable per-visitor anonymous ID, persisted to localStorage. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Stable per-chatbot-conversation ID. Resets when user clears storage. */
export function getConversationId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.sessionStorage.getItem(CONVO_KEY);
  if (!id) {
    id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(CONVO_KEY, id);
  }
  return id;
}

/** Fire-and-forget page-view log. Safe to call from any page mount. */
export async function trackVisit(path: string) {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    await getSupabase().from("bharatone_visits").insert({
      session_id: getSessionId(),
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
  } catch {
    // tracking is best-effort
  }
}

/** Save a single chatbot turn (either user or assistant). */
export async function trackChatMessage(role: "user" | "assistant", content: string) {
  if (typeof window === "undefined") return;
  try {
    await getSupabase().from("bharatone_chatbot_messages").insert({
      session_id: getSessionId(),
      conversation_id: getConversationId(),
      role,
      content,
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
    });
  } catch {
    /* best-effort */
  }
}
