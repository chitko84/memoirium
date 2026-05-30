# Memoirium Deployment

Memoirium is a Vite + React SPA backed by Supabase Auth, Postgres, RLS, and Storage.

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm tables exist:
   - `profiles`
   - `collections`
   - `memories`
   - `museum_visits`
5. Confirm Row Level Security is enabled on every table.
6. Confirm profile auto-creation trigger exists on `auth.users`.

## Storage Bucket

The schema creates the `memory-images` bucket and policies.

Expected behavior:

- Public read access for memory images.
- Authenticated uploads only.
- Upload/update/delete restricted to paths under `auth.uid()/filename`.

If bucket creation fails in SQL Editor, create `memory-images` manually in Supabase Storage, set it public, then rerun the storage policies from `schema.sql`.

## Environment Variables

Set these in local `.env`, Vercel, or Netlify:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Never expose the Supabase service role key in the frontend.

## Build

```bash
npm install
npm run typecheck
npm run build
```

Preview locally:

```bash
npm run preview
```

## Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Add env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

SPA fallback:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Add env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

SPA fallback is configured in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
