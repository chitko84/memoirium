-- MEMOIRIUM demo seed data
--
-- IMPORTANT:
-- - Replace the demo_user_id below with a real auth.users.id from your Supabase project.
-- - Run supabase/schema.sql before this file.
-- - Do not run this on production unless you intentionally want demo content in production.
-- - The demo profile username is: demo-curator

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000000';
  room_origins uuid := gen_random_uuid();
  room_city uuid := gen_random_uuid();
  room_private uuid := gen_random_uuid();
begin
  if demo_user_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Replace demo_user_id with a real auth.users.id before running seed-demo.sql.';
  end if;

  insert into public.profiles (
    id,
    username,
    display_name,
    bio,
    avatar_url,
    museum_title,
    museum_tagline,
    is_public
  )
  values (
    demo_user_id,
    'demo-curator',
    'Avery Quinn',
    'A curator of ordinary moments, preserved as luminous artifacts.',
    null,
    'The Museum of Avery Quinn',
    'A noir-and-gold archive of places, people, and memory.',
    true
  )
  on conflict (id) do update set
    username = excluded.username,
    display_name = excluded.display_name,
    bio = excluded.bio,
    avatar_url = excluded.avatar_url,
    museum_title = excluded.museum_title,
    museum_tagline = excluded.museum_tagline,
    is_public = excluded.is_public;

  insert into public.collections (
    id,
    user_id,
    title,
    slug,
    description,
    curator_note,
    cover_image_url,
    mood,
    era_start,
    era_end,
    is_public,
    sort_order
  )
  values
    (
      room_origins,
      demo_user_id,
      'Origins Hall',
      'origins-hall',
      'A room of beginnings, family rituals, and formative places.',
      'Every museum needs an entrance. This room holds the early artifacts that explain the curator.',
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&h=700&fit=crop',
      'Nostalgia',
      '2018-01-01',
      '2021-12-31',
      true,
      1
    ),
    (
      room_city,
      demo_user_id,
      'City Lights Wing',
      'city-lights-wing',
      'Urban nights, train platforms, neon reflections, and late walks.',
      'The city becomes a gallery after dark; every window is a frame.',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=700&fit=crop',
      'Wonder',
      '2022-01-01',
      '2024-12-31',
      true,
      2
    ),
    (
      room_private,
      demo_user_id,
      'Private Restoration Room',
      'private-restoration-room',
      'Unfinished and personal artifacts kept out of public view.',
      'This room is intentionally private to demonstrate RLS and visibility controls.',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=700&fit=crop',
      'Peace',
      '2025-01-01',
      null,
      false,
      3
    )
  on conflict (user_id, slug) do update set
    title = excluded.title,
    description = excluded.description,
    curator_note = excluded.curator_note,
    cover_image_url = excluded.cover_image_url,
    mood = excluded.mood,
    era_start = excluded.era_start,
    era_end = excluded.era_end,
    is_public = excluded.is_public,
    sort_order = excluded.sort_order;

  delete from public.memories where user_id = demo_user_id;

  insert into public.memories (
    user_id,
    collection_id,
    title,
    slug,
    story,
    memory_date,
    location,
    emotion,
    image_url,
    image_path,
    is_public,
    is_featured
  )
  values
    (
      demo_user_id,
      room_origins,
      'Kitchen Window Morning',
      'kitchen-window-morning',
      'Sunlight crossed the counter in a narrow gold stripe. Coffee steamed beside an old notebook, and the day felt unhurried for once.',
      '2019-04-12',
      'Portland, Oregon',
      'Gratitude',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=700&fit=crop',
      null,
      true,
      true
    ),
    (
      demo_user_id,
      room_origins,
      'Rain on the Porch',
      'rain-on-the-porch',
      'The porch became a theater of rain. We sat quietly, listening to water make music on every surface.',
      '2020-10-03',
      'Eugene, Oregon',
      'Peace',
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=900&h=700&fit=crop',
      null,
      true,
      false
    ),
    (
      demo_user_id,
      room_origins,
      'First Archive Box',
      'first-archive-box',
      'A cardboard box of ticket stubs, letters, and printed photographs became the first version of the museum.',
      '2021-02-18',
      'Home Studio',
      'Nostalgia',
      'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?w=900&h=700&fit=crop',
      null,
      true,
      true
    ),
    (
      demo_user_id,
      room_city,
      'Midnight Platform',
      'midnight-platform',
      'The last train arrived under amber lights. Everyone looked cinematic for a second, as if the city had paused for a photograph.',
      '2022-08-22',
      'Chicago, Illinois',
      'Wonder',
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900&h=700&fit=crop',
      null,
      true,
      true
    ),
    (
      demo_user_id,
      room_city,
      'Neon After Rain',
      'neon-after-rain',
      'Rain turned the street into glass. Neon signs doubled themselves on the pavement and every color felt louder.',
      '2023-05-09',
      'New York, New York',
      'Energy',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=900&h=700&fit=crop',
      null,
      true,
      false
    ),
    (
      demo_user_id,
      room_city,
      'Rooftop Farewell',
      'rooftop-farewell',
      'We watched the skyline dissolve into blue evening. Nobody wanted to say goodbye, so we kept naming the lights.',
      '2024-09-14',
      'Brooklyn, New York',
      'Love',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=900&h=700&fit=crop',
      null,
      true,
      true
    ),
    (
      demo_user_id,
      room_private,
      'Unsent Letter',
      'unsent-letter',
      'A private artifact for testing: visible to the curator only and hidden from the public museum.',
      '2025-01-17',
      'Private Archive',
      'Serenity',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&h=700&fit=crop',
      null,
      false,
      false
    ),
    (
      demo_user_id,
      room_private,
      'Restoration Table',
      'restoration-table',
      'Another private memory used to confirm private rooms and memories do not leak through public views.',
      '2025-03-06',
      'Conservation Room',
      'Focus',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=700&fit=crop',
      null,
      false,
      false
    );

  insert into public.museum_visits (profile_id, visitor_hash, visited_at)
  values
    (demo_user_id, 'seed-visitor-001', now() - interval '6 days'),
    (demo_user_id, 'seed-visitor-002', now() - interval '3 days'),
    (demo_user_id, 'seed-visitor-003', now() - interval '1 day'),
    (demo_user_id, 'seed-visitor-004', now())
  on conflict do nothing;
end $$;
