-- Storia learner profiles (run in the NEW Storia Supabase project SQL editor).
-- Do not run this on the fragrance database.

create table if not exists public.storia_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.storia_profiles enable row level security;

drop policy if exists "storia_profiles_select_own" on public.storia_profiles;
create policy "storia_profiles_select_own"
  on public.storia_profiles for select
  using (auth.uid() = id);

drop policy if exists "storia_profiles_insert_own" on public.storia_profiles;
create policy "storia_profiles_insert_own"
  on public.storia_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "storia_profiles_update_own" on public.storia_profiles;
create policy "storia_profiles_update_own"
  on public.storia_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.storia_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.storia_profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1), 'Learner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists storia_on_auth_user_created on auth.users;
create trigger storia_on_auth_user_created
  after insert on auth.users
  for each row execute function public.storia_handle_new_user();
