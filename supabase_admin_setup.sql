-- ============================================
-- Supabase Admin Setup for Class Routine App
-- ============================================

-- 1. Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- ============================================
-- IMPORTANT: If updating existing DB, run these DROP statements first:
-- ============================================
-- drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
-- drop policy if exists "Users can view own profile, admins can view all" on public.profiles;
-- drop policy if exists "Users can insert their own profile." on public.profiles;
-- drop policy if exists "Users can update own profile." on public.profiles;
-- drop policy if exists "Admins can update any profile" on public.profiles;

-- ============================================
-- 3. Create Simple & Safe RLS Policies
-- ============================================

-- Option A: Simple policy (recommended for now)
-- Everyone can read all profiles (needed for admin panel to work)
-- This is safe because profiles only contain email/username, not sensitive data
create policy "Profiles are viewable by authenticated users" on public.profiles
  for select to authenticated using (true);

-- Users can insert their own profile (handled by trigger)
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ============================================
-- 4. Create trigger to sync auth.users with profiles
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 5. [IMPORTANT] Make yourself an admin
-- ============================================
-- Run this manually after signing up with your email:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your_email@gmail.com';

-- ============================================
-- 6. Verify admin status (run this to check)
-- ============================================
-- SELECT id, email, is_admin FROM public.profiles WHERE email = 'admin@school.com';

