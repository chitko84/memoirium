-- MEMOIRIUM Admin User Emails migration.
-- Run after supabase/admin-panel.sql.
--
-- This exposes safe user email visibility to admins through an authenticated,
-- admin-verified RPC. It does not expose auth.users directly to the browser and
-- does not return password hashes, provider data, tokens, or other auth secrets.

create or replace function public.get_admin_users_with_email()
returns table (
  id uuid,
  display_name text,
  username text,
  email text,
  is_public boolean,
  role text,
  created_at timestamptz,
  total_collections bigint,
  total_memories bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_role text;
begin
  select profiles.role
  into current_role
  from public.profiles
  where profiles.id = auth.uid();

  if current_role <> 'admin' then
    raise exception 'Admin access required';
  end if;

  return query
  select
    profiles.id,
    profiles.display_name,
    profiles.username,
    auth_users.email::text,
    profiles.is_public,
    profiles.role,
    profiles.created_at,
    coalesce(collection_counts.total_collections, 0)::bigint as total_collections,
    coalesce(memory_counts.total_memories, 0)::bigint as total_memories
  from public.profiles
  left join auth.users auth_users on auth_users.id = profiles.id
  left join (
    select collections.user_id, count(*)::bigint as total_collections
    from public.collections
    group by collections.user_id
  ) collection_counts on collection_counts.user_id = profiles.id
  left join (
    select memories.user_id, count(*)::bigint as total_memories
    from public.memories
    group by memories.user_id
  ) memory_counts on memory_counts.user_id = profiles.id
  order by profiles.created_at desc;
end;
$$;

grant execute on function public.get_admin_users_with_email() to authenticated;
