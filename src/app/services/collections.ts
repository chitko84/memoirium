import { supabase } from "../lib/supabase";
import type { Collection } from "../types/memoirium";

export type CollectionCreateInput = {
  user_id: string;
  title: string;
  slug: string;
  description: string;
  curator_note?: string | null;
  cover_image_url?: string | null;
  mood?: string | null;
  era_start?: string | null;
  era_end?: string | null;
  is_public: boolean;
  sort_order?: number;
};

export type CollectionUpdateInput = Partial<Omit<CollectionCreateInput, "user_id">>;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getUserCollections(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as Collection[];
}

export async function getCollectionById(id: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("collections").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Collection;
}

export async function createCollection(data: CollectionCreateInput) {
  const client = requireSupabase();
  const { data: collection, error } = await client.from("collections").insert(data).select("*").single();

  if (error) throw error;
  return collection as Collection;
}

export async function updateCollection(id: string, data: CollectionUpdateInput) {
  const client = requireSupabase();
  const { data: collection, error } = await client
    .from("collections")
    .update(data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return collection as Collection;
}

export async function deleteCollection(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("collections").delete().eq("id", id);

  if (error) throw error;
}
