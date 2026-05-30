import { supabase } from "../lib/supabase";
import type { Memory } from "../types/memoirium";

export type MemoryCreateInput = {
  user_id: string;
  collection_id?: string | null;
  title: string;
  slug: string;
  story: string;
  memory_date?: string | null;
  location?: string | null;
  emotion?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  is_public: boolean;
  is_featured: boolean;
};

export type MemoryUpdateInput = Partial<Omit<MemoryCreateInput, "user_id">>;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getUserMemories(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .order("memory_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Memory[];
}

export async function getMemoriesByCollection(collectionId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("memories")
    .select("*")
    .eq("collection_id", collectionId)
    .order("memory_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Memory[];
}

export async function getMemoryById(id: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("memories").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Memory;
}

export async function createMemory(data: MemoryCreateInput) {
  const client = requireSupabase();
  const { data: memory, error } = await client.from("memories").insert(data).select("*").single();

  if (error) throw error;
  return memory as Memory;
}

export async function updateMemory(id: string, data: MemoryUpdateInput) {
  const client = requireSupabase();
  const { data: memory, error } = await client.from("memories").update(data).eq("id", id).select("*").single();

  if (error) throw error;
  return memory as Memory;
}

export async function deleteMemory(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("memories").delete().eq("id", id);

  if (error) throw error;
}

export async function uploadMemoryImage(userId: string, file: File) {
  const client = requireSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error } = await client.storage.from("memory-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = client.storage.from("memory-images").getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export async function deleteMemoryImage(path: string) {
  const client = requireSupabase();
  const { error } = await client.storage.from("memory-images").remove([path]);

  if (error) throw error;
}
