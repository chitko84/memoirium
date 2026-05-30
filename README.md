# Memoirium

**Every memory deserves a gallery.**

Memoirium is a production-ready Vite + React digital museum product for turning personal memories into immersive noir/gold exhibition rooms, framed memory artifacts, timelines, public museums, and a 3D-looking gallery hallway.

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

The schema includes profile auto-creation from Supabase Auth metadata:

- `username`
- `display_name`

## Run Locally

```bash
npm install
npm run dev
```

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
