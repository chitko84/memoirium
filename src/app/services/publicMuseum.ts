import { supabase } from "../lib/supabase";
import type { Collection, Memory, Profile } from "../types/memoirium";
import { getAnonymousVisitorId } from "./visitorIdentity";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getPublicMuseumByUsername(username: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function getPublicCollections(profileId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("user_id", profileId)
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Collection[];
}

export async function getPublicFeaturedMemories(profileId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("memories")
    .select("*")
    .eq("user_id", profileId)
    .eq("is_public", true)
    .eq("is_featured", true)
    .order("memory_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Memory[];
}

export async function getPublicMemoriesByCollection(collectionId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("memories")
    .select("*")
    .eq("collection_id", collectionId)
    .eq("is_public", true)
    .order("memory_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Memory[];
}

export async function recordMuseumVisit(profileId: string) {
  const client = requireSupabase();

  const { error } = await client.from("museum_visits").insert({
    profile_id: profileId,
    visitor_hash: getAnonymousVisitorId(),
  });

  if (error) throw error;
}

export async function getPublicMuseumVisitCount(profileId: string) {
  const client = requireSupabase();
  const { count, error } = await client
    .from("museum_visits")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  if (error) throw error;
  return count ?? 0;
}
