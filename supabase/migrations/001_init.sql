-- Profiles table, linked 1:1 with Supabase Auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Error reports table
create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code_snippet text not null,
  error_message text not null,
  programming_language text not null,
  ai_analysis jsonb not null,
  solved boolean not null default true,
  bookmarked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists error_reports_user_id_idx on public.error_reports (user_id, created_at desc);

alter table public.error_reports enable row level security;

create policy "Users can view their own error reports"
  on public.error_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert their own error reports"
  on public.error_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own error reports"
  on public.error_reports for update
  using (auth.uid() = user_id);

create policy "Users can delete their own error reports"
  on public.error_reports for delete
  using (auth.uid() = user_id);
