-- Migration: Add role column to storia_profiles and preserve developer roles in Supabase auth triggers.
-- Run in the Storibase Supabase SQL editor.

-- 1. Add role column to storia_profiles (default 'learner')
alter table public.storia_profiles
  add column if not exists role text not null default 'learner';

-- 2. Update trigger to populate role from user metadata on signup
create or replace function public.storia_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.storia_profiles (id, display_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1), 'Learner'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'learner')
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    role = case
      when excluded.role in ('developer', 'admin') then excluded.role
      else public.storia_profiles.role
    end;
  return new;
end;
$$;

-- To promote an existing account to developer in Supabase SQL editor, run:
-- UPDATE public.storia_profiles SET role = 'developer' WHERE id IN (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
-- UPDATE auth.users SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "developer"}'::jsonb WHERE email = 'your-email@example.com';
