-- MEMOIRIUM Admin Delete migration.
-- Run after supabase/admin-panel.sql.
--
-- These RPCs let authenticated admins delete profile/museum data without
-- exposing a Supabase service role key to the Vite client.

create or replace function public.admin_delete_profile(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_profile_id = auth.uid() then
    raise exception 'Admins cannot delete their own profile from the admin panel';
  end if;

  delete from public.memory_likes
  where memory_id in (
    select id from public.memories where user_id = p_profile_id
  );

  delete from public.memory_comments
  where memory_id in (
    select id from public.memories where user_id = p_profile_id
  );

  delete from public.museum_guestbook
  where profile_id = p_profile_id;

  delete from public.museum_visits
  where profile_id = p_profile_id;

  delete from public.memories
  where user_id = p_profile_id;

  delete from public.collections
  where user_id = p_profile_id;

  delete from public.profiles
  where id = p_profile_id;
end;
$$;

create or replace function public.admin_delete_museum(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.admin_delete_profile(p_profile_id);
end;
$$;

grant execute on function public.admin_delete_profile(uuid) to authenticated;
grant execute on function public.admin_delete_museum(uuid) to authenticated;

drop policy if exists "profiles admins delete all except self" on public.profiles;
create policy "profiles admins delete all except self"
on public.profiles
for delete
to authenticated
using (public.is_admin() and id <> auth.uid());

drop policy if exists "collections admins delete all" on public.collections;
create policy "collections admins delete all"
on public.collections
for delete
to authenticated
using (public.is_admin());

drop policy if exists "memories admins delete all" on public.memories;
create policy "memories admins delete all"
on public.memories
for delete
to authenticated
using (public.is_admin());

drop policy if exists "museum visits admins delete all" on public.museum_visits;
create policy "museum visits admins delete all"
on public.museum_visits
for delete
to authenticated
using (public.is_admin());

drop policy if exists "memory likes admins delete all" on public.memory_likes;
create policy "memory likes admins delete all"
on public.memory_likes
for delete
to authenticated
using (public.is_admin());
