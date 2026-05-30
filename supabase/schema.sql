-- MEMOIRIUM production Supabase schema
--
-- How to run:
-- 1. Open your Supabase project.
-- 2. Go to SQL Editor.
-- 3. Paste this entire file and run it.
-- 4. Run it again after edits as needed; policies/triggers are dropped and recreated.
--
-- Notes:
-- - This schema assumes Supabase Auth is enabled.
-- - Storage policies target a public bucket named memory-images.
-- - User-owned storage paths must use: {auth.uid()}/{filename}

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  museum_title text,
  museum_tagline text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_-]{3,32}$')
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  curator_note text,
  cover_image_url text,
  mood text,
  era_start date,
  era_end date,
  is_public boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint collections_era_order check (era_start is null or era_end is null or era_start <= era_end),
  constraint collections_user_slug_unique unique (user_id, slug)
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  title text not null,
  slug text not null,
  story text not null default '',
  memory_date date,
  location text,
  emotion text,
  image_url text,
  image_path text,
  is_public boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint memories_user_slug_unique unique (user_id, slug)
);

create table if not exists public.museum_visits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  visitor_hash text,
  visited_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists collections_user_id_idx on public.collections (user_id);
create index if not exists collections_slug_idx on public.collections (slug);
create index if not exists memories_user_id_idx on public.memories (user_id);
create index if not exists memories_collection_id_idx on public.memories (collection_id);
create index if not exists memories_memory_date_idx on public.memories (memory_date);
create index if not exists memories_slug_idx on public.memories (slug);
create index if not exists museum_visits_profile_id_idx on public.museum_visits (profile_id);

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.memories enable row level security;
alter table public.museum_visits enable row level security;

drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles public select" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;

create policy "profiles select own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles public select"
on public.profiles
for select
to anon, authenticated
using (is_public = true);

create policy "profiles update own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles insert own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "collections users select own" on public.collections;
drop policy if exists "collections public select" on public.collections;
drop policy if exists "collections users insert own" on public.collections;
drop policy if exists "collections users update own" on public.collections;
drop policy if exists "collections users delete own" on public.collections;

create policy "collections users select own"
on public.collections
for select
to authenticated
using (auth.uid() = user_id);

create policy "collections public select"
on public.collections
for select
to anon, authenticated
using (
  is_public = true
  and exists (
    select 1
    from public.profiles owner_profile
    where owner_profile.id = collections.user_id
      and owner_profile.is_public = true
  )
);

create policy "collections users insert own"
on public.collections
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "collections users update own"
on public.collections
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "collections users delete own"
on public.collections
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "memories users select own" on public.memories;
drop policy if exists "memories public select" on public.memories;
drop policy if exists "memories users insert own" on public.memories;
drop policy if exists "memories users update own" on public.memories;
drop policy if exists "memories users delete own" on public.memories;

create policy "memories users select own"
on public.memories
for select
to authenticated
using (auth.uid() = user_id);

create policy "memories public select"
on public.memories
for select
to anon, authenticated
using (
  is_public = true
  and exists (
    select 1
    from public.profiles owner_profile
    where owner_profile.id = memories.user_id
      and owner_profile.is_public = true
  )
);

create policy "memories users insert own"
on public.memories
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    collection_id is null
    or exists (
      select 1
      from public.collections owner_collection
      where owner_collection.id = memories.collection_id
        and owner_collection.user_id = auth.uid()
    )
  )
);

create policy "memories users update own"
on public.memories
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    collection_id is null
    or exists (
      select 1
      from public.collections owner_collection
      where owner_collection.id = memories.collection_id
        and owner_collection.user_id = auth.uid()
    )
  )
);

create policy "memories users delete own"
on public.memories
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "museum visits public insert" on public.museum_visits;
drop policy if exists "museum visits owners select" on public.museum_visits;

create policy "museum visits public insert"
on public.museum_visits
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.profiles visited_profile
    where visited_profile.id = museum_visits.profile_id
      and visited_profile.is_public = true
  )
);

create policy "museum visits owners select"
on public.museum_visits
for select
to authenticated
using (auth.uid() = profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_collections_updated_at on public.collections;
create trigger set_collections_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

drop trigger if exists set_memories_updated_at on public.memories;
create trigger set_memories_updated_at
before update on public.memories
for each row execute function public.set_updated_at();

create or replace function public.normalize_username(input text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(coalesce(input, ''), '[^a-z0-9_-]+', '', 'g'));
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  final_username text;
  fallback_name text;
begin
  requested_username := public.normalize_username(new.raw_user_meta_data->>'username');

  if requested_username is null or length(requested_username) < 3 then
    requested_username := public.normalize_username(split_part(new.email, '@', 1));
  end if;

  if requested_username is null or length(requested_username) < 3 then
    requested_username := 'curator';
  end if;

  final_username := left(requested_username, 23) || '_' || substring(new.id::text from 1 for 8);
  fallback_name := coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Memoirium Curator');

  insert into public.profiles (
    id,
    username,
    display_name,
    museum_title,
    museum_tagline
  )
  values (
    new.id,
    final_username,
    fallback_name,
    fallback_name || '''s Museum',
    'Every memory deserves a gallery.'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-images',
  'memory-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "memory images public read" on storage.objects;
drop policy if exists "memory images users upload own folder" on storage.objects;
drop policy if exists "memory images users update own folder" on storage.objects;
drop policy if exists "memory images users delete own folder" on storage.objects;

create policy "memory images public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'memory-images');

create policy "memory images users upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "memory images users update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "memory images users delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'memory-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
