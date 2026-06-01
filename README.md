# Memoirium

**Every memory deserves a gallery.**

Memoirium is a production-ready Vite + React digital museum product for turning personal memories into immersive noir/gold exhibition rooms, framed memory artifacts, timelines, public museums, a 3D-looking gallery hallway, and a true 3D museum wing.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Row Level Security, and Storage
- React Router
- Motion animations
- Vercel or Netlify deployment

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required Vite variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Only use the Supabase anon key in the client. Never expose the service role key in this app.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm these tables exist:
   - `profiles`
   - `collections`
   - `memories`
   - `museum_visits`
5. Confirm RLS is enabled on all public tables.
6. Confirm the `memory-images` Storage bucket exists.
7. Confirm Storage policies allow public reads and authenticated writes only under `auth.uid()/filename`.
8. Run `supabase/phase5-engagement.sql` to enable guestbook, likes, and comments.
9. Run `supabase/admin-panel.sql` to enable admin roles and admin RLS policies.
10. Run `supabase/admin-user-emails.sql` to let admins view user emails through a safe RPC.

The schema includes profile auto-creation from Supabase Auth metadata:

- `username`
- `display_name`

### Admin Panel

Memoirium includes an admin-only platform dashboard at `/admin` with:

- Platform overview stats.
- User and public museum inventory.
- Guestbook/comment moderation.
- Simple engagement analytics.

Admins are controlled by the `profiles.role` column. No user is promoted automatically.
User emails are not queried from `auth.users` directly in the browser. The Users page calls the admin-verified `get_admin_users_with_email()` RPC, which returns only safe profile fields plus email, `collection_count`, and `memory_count`.

Manual promotion example:

```sql
update public.profiles
set role = 'admin'
where id = '00000000-0000-0000-0000-000000000000';
```

To promote by email, identify the user id from Supabase Auth in the Supabase dashboard, then update `public.profiles` by `id`. Do not expose the Supabase service role key in the Vite client.

## Run Locally

```bash
npm install
npm run dev
```

## Optional Ambient Audio

Memoirium includes a museum ambience control on `/gallery` and public museums. Audio is off by default and never autoplays. To enable it, place an MP3 file at:

```txt
public/audio/museum-ambient.mp3
```

If the file is missing, the control renders a disabled “Add audio file” state.

## Phase 5 Features

- Visitor guestbook for public museums.
- Memory likes and visitor comments.
- Guided tours for private galleries and public museums.
- Optional ambient audio.
- Rule-based, AI-ready curator notes.
- Private and public Memory Map experiences.
- Local museum achievement system.
- Shareable Museum Card with copy/share actions.

## Phase 6 3D Museum

- Protected flagship route at `/museum-3d`.
- True Three.js room rendered with `three`, `@react-three/fiber`, and `@react-three/drei`.
- Real Supabase exhibition rooms become separate 3D rooms.
- Cinematic “Enter 3D Museum” screen before loading the room.
- Noir/gold room atmosphere with warm lights, gold frames, subtle reflection, wall depth, and lightweight particles.
- Guided 3D tour that focuses the camera on one framed memory at a time.
- Performance guardrails: limited visible frames per room and defensive texture loading.

## Production Checks

```bash
npm run typecheck
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy To Vercel

1. Import the repository into Vercel.
2. Set framework preset to `Vite`.
3. Set build command:
   ```bash
   npm run build
   ```
4. Set output directory:
   ```bash
   dist
   ```
5. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

For SPA routing, Vercel should serve `index.html` for client routes. If needed, add a rewrite from `/(.*)` to `/index.html`.

## Deploy To Netlify

1. Import the repository into Netlify.
2. Set build command:
   ```bash
   npm run build
   ```
3. Set publish directory:
   ```bash
   dist
   ```
4. Add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Add SPA fallback routing if needed:
   ```txt
   /* /index.html 200
   ```

## Core Product Surfaces

- Authenticated curator dashboard
- Exhibition room CRUD
- Memory artifact CRUD with Supabase Storage uploads
- Timeline from real memories
- Public museum at `/museum/:username`
- Immersive CSS-based Museum Gallery at `/gallery`
- True 3D Museum at `/museum-3d`
- Admin panel at `/admin` for admins only
