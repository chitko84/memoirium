# Memoirium Testing Checklist

Use this checklist after running `supabase/schema.sql` and configuring `.env`.

## Auth

- Register a new account with display name, username, email, and password.
- If email confirmation is enabled, confirm the email and then log in.
- Log in with the new account.
- Log out from the sidebar or navbar.
- Confirm private routes redirect to `/login` after logout.

## Profile Settings

- Open `/settings`.
- Update display name, username, bio, avatar URL, museum title, museum tagline, and public visibility.
- Try a duplicate username and confirm a friendly error appears.
- Copy the public museum link.
- Confirm “View Public Museum” is disabled when `is_public` is off.
- Turn `is_public` on and open the public museum link.
- Confirm the Share Museum card uses real profile data, public room count, public artifact count, and public museum URL.
- Test Copy Museum Link and Copy Share Text.
- If supported by the browser, test the Share button opens the native share sheet.

## Exhibition Rooms

- Create an exhibition room with title, description, curator note, mood, era dates, visibility, and cover URL.
- Edit the room and confirm changes persist after refresh.
- Delete a room and confirm it disappears.
- Confirm private rooms do not appear on the public museum page.

## Memories

- Create a memory from an exhibition room.
- Upload an image and confirm it appears in the room and memory detail page.
- Edit text fields on a memory.
- Replace an image and confirm the new image appears.
- Delete a memory and confirm it disappears from room, dashboard, timeline, and gallery.
- Confirm private memories do not appear on the public museum page.

## Timeline

- Open `/timeline`.
- Confirm real memories are grouped by year and sorted by date.
- Confirm empty state appears for a new account with no memories.

## Memory Map

- Open `/map` while logged in.
- Confirm memories are grouped by real location text only.
- Confirm each location card shows location name, memory count, latest memory title, latest memory date, and emotions found there.
- Click a location card and confirm its real memories expand.
- Click an expanded memory and confirm `/memory/:id` opens.
- Confirm memories without location do not appear on the map.
- Confirm a new account or account with no located memories shows the empty state encouraging location details.
- Confirm `/map` redirects to `/login` after logout.

## Museum Gallery

- Open `/gallery`.
- Enter the gallery from the intro state.
- Test emotion filter, exhibition room filter, newest/oldest sort, and cinematic mode.
- Click an artifact and confirm the preview overlay opens.
- Use “View Full Artifact” and confirm `/memory/:id` opens.
- Confirm “Curator’s Note” appears in the artifact preview overlay.
- Start Guided Tour and confirm it walks through the currently filtered/sorted memories.
- Confirm the current guided-tour artifact is highlighted in the gallery.
- Test guided-tour Previous, Next, End Tour, View Full Artifact, ArrowLeft, ArrowRight, and Escape controls.
- Confirm Start Guided Tour is disabled or harmless when no memories match the current filters.
- Confirm the ambient audio control is off by default, does not autoplay, and shows an “Add audio file” state when `public/audio/museum-ambient.mp3` is missing.
- Confirm mobile layout stacks cleanly.

## 3D Museum

- Open `/museum-3d` while logged in.
- Confirm the cinematic “Enter 3D Museum” screen appears before the 3D scene.
- Click “Enter 3D Museum” and confirm the 3D room loads.
- Confirm real exhibition rooms appear in the room selector.
- Confirm Previous Room, Next Room, and Enter Next Room update the room title, curator note, and wall frames.
- Confirm the gold doorway, warm lights, gold frames, wall depth, subtle floor reflection, and lightweight particles render without blocking controls.
- Confirm room memories come from real Supabase data only.
- Click a 3D frame and confirm the artifact overlay shows title, image or fallback, date, emotion, location, story preview, and View Full Artifact.
- Start the 3D guided tour and confirm the camera focuses one frame at a time.
- Test guided tour Next, Previous, End Tour, and View Full controls.
- Confirm rooms with more than the visible frame limit show a performance note instead of rendering every artifact.
- Confirm missing or failed images show a safe fallback frame instead of crashing.
- On mobile width, confirm the desktop recommendation appears and simplified artifact cards remain usable.

## Public Museum

- Open `/museum/:username` while logged out.
- Confirm public profile, public rooms, public memories, featured artifacts, and stats appear.
- Confirm private rooms and private memories are hidden.
- Confirm missing/private museum usernames show a not-found state.
- Confirm the public Share Museum section shows only public museum data and the correct public URL.
- Test Copy Museum Link, Copy Share Text, and Web Share if supported.
- Start Public Tour and confirm it uses only visible public memories.
- Confirm public guided-tour Previous, Next, End Tour, View Full Artifact, ArrowLeft, ArrowRight, and Escape controls work.
- Confirm the current public guided-tour artifact is highlighted on the public museum page.
- Confirm public memory cards show “Curator’s Note” without exposing private data.
- Confirm the public museum ambient audio control is off by default and requires a click to play.
- Confirm the public Memory Map section shows only public memories with location.
- Confirm private memories and private-room memories do not appear in public Memory Map cards or expanded lists.

## Achievements

- Open `/dashboard` and confirm Museum Achievements appears.
- Confirm achievement progress values match real profile, collections, memories, dates, images, featured flags, public status, and locations.
- Add the first collection and confirm First Exhibition Room unlocks.
- Add the first memory and confirm First Artifact unlocks.
- Mark the profile public and confirm Public Museum Published unlocks.
- Add memories with three different locations and confirm World Memory Keeper unlocks.
- Open `/settings` and confirm the achievement summary shows unlocked count / total achievements.
- With the museum private, confirm Settings prompts the curator to publish for the public badge.

## Memory Details

- Open a memory detail page.
- Confirm “Curator’s Note” appears above the story and is generated from the real memory fields.

## Public Engagement

- Run `supabase/phase5-engagement.sql` after the base schema.
- Open a public museum while logged out and sign the guestbook with a name and message.
- Refresh the page and confirm the guestbook entry remains visible.
- Try submitting an empty guestbook form and confirm validation appears without saving.
- Like a featured artifact and a room memory card, then refresh and confirm counts persist.
- Like the same memory again from the same browser and confirm it does not create duplicate likes.
- Expand comments under a public memory, add a visitor comment, and confirm it appears.
- Confirm guestbook, likes, and comments are unavailable for private profiles or private memories.
- Log in as the museum owner and confirm RLS allows deleting own guestbook entries and comments through service calls.

## Admin Panel

- Run `supabase/admin-panel.sql` after the base schema and engagement migration.
- Confirm a normal logged-in user visiting `/admin` sees the premium “Access Restricted” state.
- Promote a test profile manually with `update public.profiles set role = 'admin' where id = '<profile-id>';`.
- Run `supabase/admin-user-emails.sql` and confirm `/admin/users` shows emails through the admin-only `get_admin_users_with_email()` RPC.
- Log in as that admin and confirm `/admin`, `/admin/users`, `/admin/museums`, `/admin/moderation`, and `/admin/analytics` load.
- Confirm the regular sidebar shows “Admin Wing” only for the admin user.
- On `/admin/users`, test search by display name, username, and email.
- On `/admin/users`, test role filter, public/private museum status, collection counts, memory counts, created date, and role badge.
- On `/admin/museums`, test search and confirm public museum links open `/museum/:username`.
- On `/admin/moderation`, delete a guestbook entry after confirmation and confirm it disappears.
- On `/admin/moderation`, delete a memory comment after confirmation and confirm it disappears.
- On `/admin/analytics`, confirm rankings and recent activity cards reflect existing visits, likes, comments, and guestbook records.
- Confirm a normal user cannot query all profiles, collections, memories, visits, guestbook entries, comments, or likes through the admin UI.

## Privacy Checks

- Account A should not see Account B private dashboard data.
- Account A should not load Account B private collection or memory detail routes.
- Public museum should only show data where owner profile is public and records are public.
- Public Memory Map should only show public memories owned by a public profile.
- Private `/map` should only show the authenticated curator’s own memories.
- Storage uploads should be under `auth.uid()/filename`.
