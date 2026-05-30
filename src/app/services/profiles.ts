import { supabase } from "../lib/supabase";
import type { Profile } from "../types/memoirium";

export type ProfileUpdateInput = Partial<
  Pick<
    Profile,
    | "display_name"
    | "username"
    | "bio"
    | "avatar_url"
    | "museum_title"
    | "museum_tagline"
    | "is_public"
  >
>;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getCurrentProfile(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, data: ProfileUpdateInput) {
  const client = requireSupabase();
  const { data: profile, error } = await client
    .from("profiles")
    .upsert({ id: userId, ...data }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;
  return profile as Profile;
}

export async function uploadAvatar(userId: string, file: File) {
  const client = requireSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${userId}/avatar-${Date.now()}-${safeName}`;

  const { error } = await client.storage.from("memory-images").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw error;

  const { data } = client.storage.from("memory-images").getPublicUrl(path);
  return data.publicUrl;
}
