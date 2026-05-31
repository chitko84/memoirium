import { supabase } from "../lib/supabase";
import type { MemoryComment } from "../types/memoirium";
import { getAnonymousVisitorId } from "./visitorIdentity";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getMemoryLikeCounts(memoryIds: string[]) {
  const uniqueMemoryIds = Array.from(new Set(memoryIds));

  if (uniqueMemoryIds.length === 0) {
    return {} as Record<string, number>;
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("memory_likes")
    .select("memory_id")
    .in("memory_id", uniqueMemoryIds);

  if (error) throw error;

  return (data ?? []).reduce<Record<string, number>>((counts, like) => {
    if (like.memory_id) {
      counts[like.memory_id] = (counts[like.memory_id] ?? 0) + 1;
    }

    return counts;
  }, {});
}

export async function likeMemory(memoryId: string) {
  const client = requireSupabase();
  const { error } = await client.from("memory_likes").insert({
    memory_id: memoryId,
    visitor_hash: getAnonymousVisitorId(),
  });

  if (error && error.code !== "23505") {
    throw error;
  }
}

export async function getMemoryComments(memoryId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("memory_comments")
    .select("*")
    .eq("memory_id", memoryId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as MemoryComment[];
}

export async function addMemoryComment(memoryId: string, visitorName: string, comment: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("memory_comments")
    .insert({
      memory_id: memoryId,
      visitor_name: visitorName.trim(),
      comment: comment.trim(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as MemoryComment;
}

export async function deleteMemoryComment(commentId: string) {
  const client = requireSupabase();
  const { error } = await client.from("memory_comments").delete().eq("id", commentId);

  if (error) throw error;
}
