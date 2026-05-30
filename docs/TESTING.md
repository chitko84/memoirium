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

## Museum Gallery

- Open `/gallery`.
- Enter the gallery from the intro state.
- Test emotion filter, exhibition room filter, newest/oldest sort, and cinematic mode.
- Click an artifact and confirm the preview overlay opens.
- Use “View Full Artifact” and confirm `/memory/:id` opens.
- Confirm mobile layout stacks cleanly.

## Public Museum

- Open `/museum/:username` while logged out.
- Confirm public profile, public rooms, public memories, featured artifacts, and stats appear.
- Confirm private rooms and private memories are hidden.
- Confirm missing/private museum usernames show a not-found state.

## Privacy Checks

- Account A should not see Account B private dashboard data.
- Account A should not load Account B private collection or memory detail routes.
- Public museum should only show data where owner profile is public and records are public.
- Storage uploads should be under `auth.uid()/filename`.
