import { supabase } from "../lib/supabase";
import type { MuseumGuestbookEntry } from "../types/memoirium";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getGuestbookEntries(profileId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("museum_guestbook")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) throw error;
  return data as MuseumGuestbookEntry[];
}

export async function addGuestbookEntry(profileId: string, visitorName: string, message: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("museum_guestbook")
    .insert({
      profile_id: profileId,
      visitor_name: visitorName.trim(),
      message: message.trim(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as MuseumGuestbookEntry;
}

export async function deleteGuestbookEntry(entryId: string) {
  const client = requireSupabase();
  const { error } = await client.from("museum_guestbook").delete().eq("id", entryId);

  if (error) throw error;
}
