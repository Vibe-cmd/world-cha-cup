create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  personal_tag text,
  favorite_team text,
  avatar text,
  palette jsonb not null default '{}'::jsonb,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists personal_tag text;
alter table public.profiles add column if not exists favorite_team text;
alter table public.profiles add column if not exists avatar text;
alter table public.profiles add column if not exists palette jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists points integer not null default 0;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.match_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null,
  prediction text not null check (prediction in ('home', 'draw', 'away')),
  locked_at timestamptz,
  awarded_points integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table if not exists public.bracket_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bracket jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  match_label text not null,
  youtube_id text not null,
  description text,
  highlight_date date not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.api_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.api_cache add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.api_cache add column if not exists expires_at timestamptz not null default now();
alter table public.api_cache add column if not exists updated_at timestamptz not null default now();

alter table public.profiles enable row level security;
alter table public.match_predictions enable row level security;
alter table public.bracket_predictions enable row level security;
alter table public.highlights enable row level security;
alter table public.admins enable row level security;
alter table public.api_cache enable row level security;

revoke all on public.profiles from anon;
revoke all on public.match_predictions from anon;
revoke all on public.bracket_predictions from anon;
revoke all on public.highlights from anon;
revoke all on public.admins from anon;
revoke all on public.api_cache from anon;

drop policy if exists "profiles are visible to authenticated users" on public.profiles;
drop policy if exists "users can create their own profile" on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;
drop policy if exists "predictions are visible to authenticated users" on public.match_predictions;
drop policy if exists "users manage own match predictions" on public.match_predictions;
drop policy if exists "users manage own bracket predictions" on public.bracket_predictions;
drop policy if exists "highlights are visible to authenticated users" on public.highlights;
drop policy if exists "admins manage highlights" on public.highlights;
drop policy if exists "admins can read admin rows" on public.admins;
drop policy if exists "authenticated users can read api cache" on public.api_cache;
drop policy if exists "authenticated users can refresh api cache" on public.api_cache;
drop policy if exists "authenticated users can update api cache" on public.api_cache;

create policy "profiles are visible to authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "predictions are visible to authenticated users"
  on public.match_predictions for select
  to authenticated
  using (true);

create policy "users manage own match predictions"
  on public.match_predictions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users manage own bracket predictions"
  on public.bracket_predictions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "highlights are visible to authenticated users"
  on public.highlights for select
  to authenticated
  using (true);

create policy "admins manage highlights"
  on public.highlights for all
  to authenticated
  using (exists (select 1 from public.admins where admins.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where admins.user_id = (select auth.uid())));

create policy "admins can read admin rows"
  on public.admins for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "authenticated users can read api cache"
  on public.api_cache for select
  to authenticated
  using (expires_at > now());

create policy "authenticated users can refresh api cache"
  on public.api_cache for insert
  to authenticated
  with check (exists (select 1 from public.admins where admins.user_id = (select auth.uid())));

create policy "authenticated users can update api cache"
  on public.api_cache for update
  to authenticated
  using (exists (select 1 from public.admins where admins.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admins where admins.user_id = (select auth.uid())));
