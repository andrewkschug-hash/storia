-- Storibase learner sync: onboarding + per-story reading progress.
-- Run in the Storibase Supabase SQL editor (pzovnlxkvsnsivicxazd), not the fragrance project.

alter table public.storia_profiles
  add column if not exists onboarding_completed_at timestamptz;

create table if not exists public.storia_story_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  story_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

alter table public.storia_story_progress enable row level security;

drop policy if exists "storia_story_progress_select_own" on public.storia_story_progress;
create policy "storia_story_progress_select_own"
  on public.storia_story_progress for select
  using (auth.uid() = user_id);

drop policy if exists "storia_story_progress_insert_own" on public.storia_story_progress;
create policy "storia_story_progress_insert_own"
  on public.storia_story_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "storia_story_progress_update_own" on public.storia_story_progress;
create policy "storia_story_progress_update_own"
  on public.storia_story_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "storia_story_progress_delete_own" on public.storia_story_progress;
create policy "storia_story_progress_delete_own"
  on public.storia_story_progress for delete
  using (auth.uid() = user_id);
