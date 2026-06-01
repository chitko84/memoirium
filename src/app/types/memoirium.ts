export type Emotion =
  | "Joy"
  | "Love"
  | "Peace"
  | "Adventure"
  | "Pride"
  | "Nostalgia"
  | "Wonder"
  | "Gratitude"
  | "Serenity"
  | "Freedom"
  | "Energy";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  museum_title: string | null;
  museum_tagline: string | null;
  is_public: boolean;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

export type Collection = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  curator_note: string | null;
  cover_image_url: string | null;
  mood: string | null;
  era_start: string | null;
  era_end: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Memory = {
  id: string;
  user_id: string;
  collection_id: string | null;
  title: string;
  slug: string;
  story: string;
  memory_date: string | null;
  location: string | null;
  emotion: string | null;
  image_url: string | null;
  image_path: string | null;
  is_public: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type MuseumVisit = {
  id: string;
  profile_id: string;
  visitor_hash: string | null;
  visited_at: string;
};

export type MuseumGuestbookEntry = {
  id: string;
  profile_id: string | null;
  visitor_name: string;
  message: string;
  created_at: string;
};

export type MemoryLike = {
  id: string;
  memory_id: string | null;
  visitor_hash: string;
  created_at: string;
};

export type MemoryComment = {
  id: string;
  memory_id: string | null;
  visitor_name: string;
  comment: string;
  created_at: string;
};
