-- Storibase learner state: vocabulary, accessibility, adaptive, preferences.
-- Run in the Storibase Supabase SQL editor (pzovnlxkvsnsivicxazd), not the fragrance project.

create table if not exists public.storia_learner_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  vocabulary jsonb,
  accessibility jsonb,
  adaptive jsonb,
  preferences jsonb,
  updated_at timestamptz not null default now()
);

alter table public.storia_learner_state enable row level security;

drop policy if exists "storia_learner_state_select_own" on public.storia_learner_state;
create policy "storia_learner_state_select_own"
  on public.storia_learner_state for select
  using (auth.uid() = user_id);

drop policy if exists "storia_learner_state_insert_own" on public.storia_learner_state;
create policy "storia_learner_state_insert_own"
  on public.storia_learner_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "storia_learner_state_update_own" on public.storia_learner_state;
create policy "storia_learner_state_update_own"
  on public.storia_learner_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "storia_learner_state_delete_own" on public.storia_learner_state;
create policy "storia_learner_state_delete_own"
  on public.storia_learner_state for delete
  using (auth.uid() = user_id);
