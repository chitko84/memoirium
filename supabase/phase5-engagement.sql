-- Memoirium Phase 5 Part 1: public engagement features.
-- Run after supabase/schema.sql.

create table if not exists public.museum_guestbook (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  visitor_name text not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.memory_likes (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references public.memories(id) on delete cascade,
  visitor_hash text not null,
  created_at timestamptz default now(),
  constraint memory_likes_memory_visitor_unique unique (memory_id, visitor_hash)
);

create table if not exists public.memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid references public.memories(id) on delete cascade,
  visitor_name text not null,
  comment text not null,
  created_at timestamptz default now()
);

create index if not exists museum_guestbook_profile_id_idx on public.museum_guestbook (profile_id);
create index if not exists memory_likes_memory_id_idx on public.memory_likes (memory_id);
create index if not exists memory_comments_memory_id_idx on public.memory_comments (memory_id);

alter table public.museum_guestbook enable row level security;
alter table public.memory_likes enable row level security;
alter table public.memory_comments enable row level security;

drop policy if exists "guestbook public select for public profiles" on public.museum_guestbook;
drop policy if exists "guestbook public insert for public profiles" on public.museum_guestbook;
drop policy if exists "guestbook owners delete own museum entries" on public.museum_guestbook;

create policy "guestbook public select for public profiles"
on public.museum_guestbook
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.profiles public_profile
    where public_profile.id = museum_guestbook.profile_id
      and public_profile.is_public = true
  )
);

create policy "guestbook public insert for public profiles"
on public.museum_guestbook
for insert
to anon, authenticated
with check (
  length(trim(visitor_name)) between 1 and 80
  and length(trim(message)) between 1 and 1000
  and exists (
    select 1
    from public.profiles public_profile
    where public_profile.id = museum_guestbook.profile_id
      and public_profile.is_public = true
  )
);

create policy "guestbook owners delete own museum entries"
on public.museum_guestbook
for delete
to authenticated
using (auth.uid() = profile_id);

drop policy if exists "memory likes public select for public memories" on public.memory_likes;
drop policy if exists "memory likes public insert for public memories" on public.memory_likes;

create policy "memory likes public select for public memories"
on public.memory_likes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.memories public_memory
    join public.profiles owner_profile on owner_profile.id = public_memory.user_id
    where public_memory.id = memory_likes.memory_id
      and public_memory.is_public = true
      and owner_profile.is_public = true
  )
);

create policy "memory likes public insert for public memories"
on public.memory_likes
for insert
to anon, authenticated
with check (
  length(trim(visitor_hash)) between 1 and 200
  and exists (
    select 1
    from public.memories public_memory
    join public.profiles owner_profile on owner_profile.id = public_memory.user_id
    where public_memory.id = memory_likes.memory_id
      and public_memory.is_public = true
      and owner_profile.is_public = true
  )
);

drop policy if exists "memory comments public select for public memories" on public.memory_comments;
drop policy if exists "memory comments public insert for public memories" on public.memory_comments;
drop policy if exists "memory comments owners delete own memory comments" on public.memory_comments;

create policy "memory comments public select for public memories"
on public.memory_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.memories public_memory
    join public.profiles owner_profile on owner_profile.id = public_memory.user_id
    where public_memory.id = memory_comments.memory_id
      and public_memory.is_public = true
      and owner_profile.is_public = true
  )
);

create policy "memory comments public insert for public memories"
on public.memory_comments
for insert
to anon, authenticated
with check (
  length(trim(visitor_name)) between 1 and 80
  and length(trim(comment)) between 1 and 1000
  and exists (
    select 1
    from public.memories public_memory
    join public.profiles owner_profile on owner_profile.id = public_memory.user_id
    where public_memory.id = memory_comments.memory_id
      and public_memory.is_public = true
      and owner_profile.is_public = true
  )
);

create policy "memory comments owners delete own memory comments"
on public.memory_comments
for delete
to authenticated
using (
  exists (
    select 1
    from public.memories owner_memory
    where owner_memory.id = memory_comments.memory_id
      and owner_memory.user_id = auth.uid()
  )
);
