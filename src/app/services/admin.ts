import { supabase } from "../lib/supabase";
import type { Memory, MuseumGuestbookEntry, Profile } from "../types/memoirium";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function countBy<T extends Record<string, any>>(rows: T[], key: keyof T) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const value = row[key];
    if (typeof value === "string") {
      acc[value] = (acc[value] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export type AdminOverviewStats = {
  totalUsers: number;
  totalPublicMuseums: number;
  totalCollections: number;
  totalArtifacts: number;
  totalVisits: number;
  totalGuestbookEntries: number;
  totalComments: number;
  totalLikes: number;
};

export type AdminUserRow = {
  id: string;
  display_name: string;
  username: string;
  email: string | null;
  is_public: boolean;
  role: "user" | "admin";
  created_at: string;
  totalCollections: number;
  totalMemories: number;
};

export type AdminMuseumRow = {
  id: string;
  username: string;
  display_name: string;
  museum_title: string;
  is_public: boolean;
  roomCount: number;
  memoryCount: number;
  visitCount: number;
};

export type AdminModerationItem = {
  id: string;
  type: "guestbook" | "comment";
  visitor_name: string;
  body: string;
  created_at: string;
  museumTitle: string;
  memoryTitle: string | null;
};

export type AdminAnalytics = {
  mostVisitedMuseums: Array<{ id: string; title: string; username: string; count: number }>;
  mostLikedArtifacts: Array<{ id: string; title: string; count: number }>;
  mostCommentedArtifacts: Array<{ id: string; title: string; count: number }>;
  recentActivity: Array<{ label: string; count: number }>;
};

async function selectAll<T>(table: string) {
  const client = requireSupabase();
  const { data, error } = await client.from(table).select("*");

  if (error) throw error;
  return (data ?? []) as T[];
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const client = requireSupabase();
  const [
    profiles,
    publicProfiles,
    collections,
    memories,
    visits,
    guestbook,
    comments,
    likes,
  ] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("profiles").select("id", { count: "exact", head: true }).eq("is_public", true),
    client.from("collections").select("id", { count: "exact", head: true }),
    client.from("memories").select("id", { count: "exact", head: true }),
    client.from("museum_visits").select("id", { count: "exact", head: true }),
    client.from("museum_guestbook").select("id", { count: "exact", head: true }),
    client.from("memory_comments").select("id", { count: "exact", head: true }),
    client.from("memory_likes").select("id", { count: "exact", head: true }),
  ]);

  const errors = [profiles, publicProfiles, collections, memories, visits, guestbook, comments, likes]
    .map((result) => result.error)
    .filter(Boolean);
  if (errors[0]) throw errors[0];

  return {
    totalUsers: profiles.count ?? 0,
    totalPublicMuseums: publicProfiles.count ?? 0,
    totalCollections: collections.count ?? 0,
    totalArtifacts: memories.count ?? 0,
    totalVisits: visits.count ?? 0,
    totalGuestbookEntries: guestbook.count ?? 0,
    totalComments: comments.count ?? 0,
    totalLikes: likes.count ?? 0,
  };
}

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const [profiles, collections, memories] = await Promise.all([
    selectAll<Profile>("profiles"),
    selectAll<{ user_id: string }>("collections"),
    selectAll<{ user_id: string }>("memories"),
  ]);

  const collectionCounts = countBy(collections, "user_id");
  const memoryCounts = countBy(memories, "user_id");

  return profiles
    .map((profile) => ({
      id: profile.id,
      display_name: profile.display_name,
      username: profile.username,
      email: null,
      is_public: profile.is_public,
      role: profile.role ?? "user",
      created_at: profile.created_at,
      totalCollections: collectionCounts[profile.id] ?? 0,
      totalMemories: memoryCounts[profile.id] ?? 0,
    }))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export async function getAdminMuseums(): Promise<AdminMuseumRow[]> {
  const [profiles, collections, memories, visits] = await Promise.all([
    selectAll<Profile>("profiles"),
    selectAll<{ user_id: string }>("collections"),
    selectAll<{ user_id: string }>("memories"),
    selectAll<{ profile_id: string }>("museum_visits"),
  ]);

  const roomCounts = countBy(collections, "user_id");
  const memoryCounts = countBy(memories, "user_id");
  const visitCounts = countBy(visits, "profile_id");

  return profiles
    .filter((profile) => profile.is_public)
    .map((profile) => ({
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      museum_title: profile.museum_title || `${profile.display_name}'s Museum`,
      is_public: profile.is_public,
      roomCount: roomCounts[profile.id] ?? 0,
      memoryCount: memoryCounts[profile.id] ?? 0,
      visitCount: visitCounts[profile.id] ?? 0,
    }))
    .sort((a, b) => b.visitCount - a.visitCount);
}

export async function getAdminModerationItems(): Promise<AdminModerationItem[]> {
  const [guestbook, comments, profiles, memories] = await Promise.all([
    selectAll<MuseumGuestbookEntry>("museum_guestbook"),
    selectAll<{ id: string; memory_id: string | null; visitor_name: string; comment: string; created_at: string }>(
      "memory_comments",
    ),
    selectAll<Profile>("profiles"),
    selectAll<Memory>("memories"),
  ]);

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const memoryById = new Map(memories.map((memory) => [memory.id, memory]));

  return [
    ...guestbook.map((entry) => {
      const profile = entry.profile_id ? profileById.get(entry.profile_id) : null;
      return {
        id: entry.id,
        type: "guestbook" as const,
        visitor_name: entry.visitor_name,
        body: entry.message,
        created_at: entry.created_at,
        museumTitle: profile?.museum_title || profile?.display_name || "Unknown museum",
        memoryTitle: null,
      };
    }),
    ...comments.map((comment) => {
      const memory = comment.memory_id ? memoryById.get(comment.memory_id) : null;
      const profile = memory ? profileById.get(memory.user_id) : null;
      return {
        id: comment.id,
        type: "comment" as const,
        visitor_name: comment.visitor_name,
        body: comment.comment,
        created_at: comment.created_at,
        museumTitle: profile?.museum_title || profile?.display_name || "Unknown museum",
        memoryTitle: memory?.title ?? "Unknown artifact",
      };
    }),
  ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export async function deleteGuestbookEntryAsAdmin(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("museum_guestbook").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteMemoryCommentAsAdmin(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("memory_comments").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteMuseumAsAdmin(profileId: string) {
  const client = requireSupabase();
  const { error } = await client.rpc("admin_delete_museum", { p_profile_id: profileId });
  if (error) throw error;
}

export async function deleteUserProfileAsAdmin(profileId: string) {
  const client = requireSupabase();
  const { error } = await client.rpc("admin_delete_profile", { p_profile_id: profileId });
  if (error) throw error;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [museums, memories, visits, likes, comments, guestbook] = await Promise.all([
    getAdminMuseums(),
    selectAll<Memory>("memories"),
    selectAll<{ profile_id: string; visited_at: string }>("museum_visits"),
    selectAll<{ memory_id: string | null; created_at: string }>("memory_likes"),
    selectAll<{ memory_id: string | null; created_at: string }>("memory_comments"),
    selectAll<{ created_at: string }>("museum_guestbook"),
  ]);

  const memoryById = new Map(memories.map((memory) => [memory.id, memory]));
  const likeCounts = countBy(likes, "memory_id");
  const commentCounts = countBy(comments, "memory_id");
  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const rankMemories = (counts: Record<string, number>) =>
    Object.entries(counts)
      .map(([id, count]) => ({ id, title: memoryById.get(id)?.title ?? "Unknown artifact", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

  return {
    mostVisitedMuseums: museums
      .map((museum) => ({ id: museum.id, title: museum.museum_title, username: museum.username, count: museum.visitCount }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    mostLikedArtifacts: rankMemories(likeCounts),
    mostCommentedArtifacts: rankMemories(commentCounts),
    recentActivity: [
      { label: "Visits", count: visits.filter((visit) => Date.parse(visit.visited_at) >= recentCutoff).length },
      { label: "Likes", count: likes.filter((like) => Date.parse(like.created_at) >= recentCutoff).length },
      { label: "Comments", count: comments.filter((comment) => Date.parse(comment.created_at) >= recentCutoff).length },
      { label: "Guestbook", count: guestbook.filter((entry) => Date.parse(entry.created_at) >= recentCutoff).length },
    ],
  };
}
