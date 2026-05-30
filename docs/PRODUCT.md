# Memoirium Product Brief

## Vision

Memoirium turns personal memories into immersive digital museum exhibitions. It treats a memory not as a feed post, but as an artifact worthy of curation, context, and atmosphere.

## Target Users

- Families preserving personal history.
- Creators building narrative portfolios.
- Travelers and photographers organizing meaningful moments.
- Couples, graduates, and communities creating shared archives.
- Anyone who wants memory preservation to feel more premium than a folder or timeline.

## Core Features

- Supabase Auth account system.
- Public/private curator profile.
- Exhibition room creation and management.
- Memory artifact creation with image upload.
- Timeline view grouped by date.
- Public museum at `/museum/:username`.
- Immersive Museum Gallery at `/gallery`.
- Row Level Security to protect private rooms and memories.

## Signature 3D Gallery

The Museum Gallery is the product-defining experience. It uses lightweight CSS perspective instead of heavy 3D dependencies to create:

- Corridor depth.
- Gold-framed memory artifacts.
- Animated spotlights.
- Ambient particles.
- Emotion-based frame glow.
- Cinematic mode.
- Artifact preview overlays.

This gives Memoirium a spatial museum identity while staying fast and deployable as a Vite SPA.

## Roadmap

- Dedicated avatar bucket and upload UI.
- Public room detail pages.
- Visitor analytics dashboard.
- Share cards for public memories.
- Memory constellation mode.
- Collaborative museums.
- Exportable museum archive.
- Optional full WebGL/Three.js gallery after V1.

## Why Memoirium Is Not A Normal CRUD App

The core CRUD objects are only the foundation. The product experience is built around presentation, atmosphere, identity, and memory curation. Memoirium’s value is not just storing rows in a database; it is transforming personal archives into a museum-like experience people want to explore and share.
