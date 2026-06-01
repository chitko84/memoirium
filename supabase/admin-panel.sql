-- MEMOIRIUM Admin Panel migration.
-- Run after supabase/schema.sql and supabase/phase5-engagement.sql.
--
-- This migration enables admin-only platform management through RLS.
-- It does not promote any user automatically.
--
-- Manual promotion example:
-- update public.profiles
-- set role = 'admin'
-- where id = '00000000-0000-0000-0000-000000000000';
--
-- If you need to promote by email, first identify the profile id from auth.users
-- in the Supabase dashboard, then update public.profiles by id.

alter table public.profiles
add column if not exists role text not null default 'user';

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "profiles admins select all" on public.profiles;
create policy "profiles admins select all"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "collections admins select all" on public.collections;
create policy "collections admins select all"
on public.collections
for select
to authenticated
using (public.is_admin());

drop policy if exists "memories admins select all" on public.memories;
create policy "memories admins select all"
on public.memories
for select
to authenticated
using (public.is_admin());

drop policy if exists "museum visits admins select all" on public.museum_visits;
create policy "museum visits admins select all"
on public.museum_visits
for select
to authenticated
using (public.is_admin());

drop policy if exists "guestbook admins select all" on public.museum_guestbook;
create policy "guestbook admins select all"
on public.museum_guestbook
for select
to authenticated
using (public.is_admin());

drop policy if exists "guestbook admins delete all" on public.museum_guestbook;
create policy "guestbook admins delete all"
on public.museum_guestbook
for delete
to authenticated
using (public.is_admin());

drop policy if exists "memory comments admins select all" on public.memory_comments;
create policy "memory comments admins select all"
on public.memory_comments
for select
to authenticated
using (public.is_admin());

drop policy if exists "memory comments admins delete all" on public.memory_comments;
create policy "memory comments admins delete all"
on public.memory_comments
for delete
to authenticated
using (public.is_admin());

drop policy if exists "memory likes admins select all" on public.memory_likes;
create policy "memory likes admins select all"
on public.memory_likes
for select
to authenticated
using (public.is_admin());
