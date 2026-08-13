-- Optional: run in the Storia Supabase SQL editor after storia_profiles exists.
-- Stores the chosen default portrait id (libro, sole, limone, mare, caffe, olivo, roma, arancia).

alter table public.storia_profiles
  add column if not exists avatar_id text;
