-- BrandLens initial schema
-- Run with: supabase db reset

-- Profiles: user-created brand profiles
create table if not exists public.profiles (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users not null,
 name text not null,
 description text,
 target_audience text,
 personality text,
 industry text,
 created_at timestamptz default now() not null,
 updated_at timestamptz default now() not null
);

-- Colors: generated color palettes per profile
create table if not exists public.colors (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid references public.profiles(id) on delete cascade not null,
 primary text not null,
 secondary text not null,
 accent text not null,
 neutral text not null,
 created_at timestamptz default now() not null
);

-- Typography: font selections per profile
create table if not exists public.typography (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid references public.profiles(id) on delete cascade not null,
 heading_font text not null,
 body_font text not null,
 created_at timestamptz default now() not null
);

-- Voice: brand voice / copy per profile
create table if not exists public.voice (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid references public.profiles(id) on delete cascade not null,
 tone text not null,
 keywords text[] default '{}',
 tagline text,
 created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.colors enable row level security;
alter table public.typography enable row level security;
alter table public.voice enable row level security;

-- Policies: users manage their own profiles
create policy "Users manage own profiles"
 on public.profiles for all
 using (auth.uid() = user_id)
 with check (auth.uid() = user_id);

create policy "Users manage colors for own profiles"
 on public.colors for all
 using (
 exists (
 select 1 from public.profiles p
 where p.id = colors.profile_id and p.user_id = auth.uid()
 )
 );

create policy "Users manage typography for own profiles"
 on public.typography for all
 using (
 exists (
 select 1 from public.profiles p
 where p.id = typography.profile_id and p.user_id = auth.uid()
 )
 );

create policy "Users manage voice for own profiles"
 on public.voice for all
 using (
 exists (
 select 1 from public.profiles p
 where p.id = voice.profile_id and p.user_id = auth.uid()
 )
 );

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
 new.updated_at = now();
 return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
 before update on public.profiles
 for each row execute function public.handle_updated_at();
