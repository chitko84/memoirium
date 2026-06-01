-- MEMOIRIUM Admin User Emails migration.
-- Run after supabase/admin-panel.sql.
--
-- This exposes safe user email visibility to admins through an authenticated,
-- admin-verified RPC. It does not expose auth.users directly to the browser and
-- does not return password hashes, provider data, tokens, or other auth secrets.

drop function if exists public.get_admin_users_with_email();

create or replace function public.get_admin_users_with_email()
returns table (
  id uuid,
  display_name text,
  username text,
  avatar_url text,
  email text,
  is_public boolean,
  role text,
  created_at timestamptz,
  collection_count bigint,
  memory_count bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  ) then
    raise exception 'Admin access required';
  end if;

  return query
  select
    profile_row.id,
    profile_row.display_name,
    profile_row.username,
    profile_row.avatar_url::text,
    auth_users.email::text,
    profile_row.is_public,
    profile_row.role,
    profile_row.created_at,
    coalesce(collection_counts.collection_count, 0)::bigint as collection_count,
    coalesce(memory_counts.memory_count, 0)::bigint as memory_count
  from public.profiles profile_row
  left join auth.users auth_users on auth_users.id = profile_row.id
  left join (
    select collections.user_id, count(*)::bigint as collection_count
    from public.collections
    group by collections.user_id
  ) collection_counts on collection_counts.user_id = profile_row.id
  left join (
    select memories.user_id, count(*)::bigint as memory_count
    from public.memories
    group by memories.user_id
  ) memory_counts on memory_counts.user_id = profile_row.id
  order by profile_row.created_at desc;
end;
$$;

grant execute on function public.get_admin_users_with_email() to authenticated;
