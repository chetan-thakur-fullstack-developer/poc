-- ==============================================================================
-- EXECUTIVE WEALTH · SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- INSTRUCTIONS FOR SETUP:
-- 1. Go to your Supabase project dashboard: https://supabase.com/dashboard
-- 2. Click on the "SQL Editor" in the left sidebar.
-- 3. Click "New query", paste this entire script, and click "Run".
-- 4. This will create all required tables, enable Row Level Security (RLS),
--    configure security policies, and set up automatic user profile creation!
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  handle text unique,
  role text default 'owner',
  selected_currency text default 'USD',
  theme text default 'dark',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PORTFOLIOS (Yearly breakdown, account balances, salary, and limits)
create table if not exists public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  year text not null,
  salary numeric default 0,
  balances jsonb default '{}'::jsonb,
  invested jsonb default '{}'::jsonb,
  contri jsonb default '{}'::jsonb,
  categories jsonb default '[]'::jsonb,
  irs_limits jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, year)
);

-- 3. ACCOUNTS (Linked bank, brokerage, retirement & credit accounts)
create table if not exists public.accounts (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  institution text,
  type text not null, -- 'checking', 'savings', 'credit', 'investment', 'retirement'
  mask text,
  balance numeric default 0,
  color text default '#8B5CF6',
  source text default 'manual', -- 'manual' or 'plaid'
  account_id text,
  mapping jsonb default '{}'::jsonb,
  last_synced timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. EXPENSE SETTINGS & CARDS
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  monthly_budget numeric default 3000,
  categories jsonb default '[]'::jsonb,
  cards jsonb default '[]'::jsonb,
  selected_currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TRANSACTIONS
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  description text,
  card_id text,
  category_id text,
  date date not null default current_date,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. GOALS
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text default 'Savings',
  target_amount numeric not null,
  current_amount numeric default 0,
  target_date date,
  color text default '#10B981',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can only read and modify their own data
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.accounts enable row level security;
alter table public.expenses enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Portfolios Policies
create policy "Users can view own portfolios" on public.portfolios for select using (auth.uid() = user_id);
create policy "Users can insert own portfolios" on public.portfolios for insert with check (auth.uid() = user_id);
create policy "Users can update own portfolios" on public.portfolios for update using (auth.uid() = user_id);
create policy "Users can delete own portfolios" on public.portfolios for delete using (auth.uid() = user_id);

-- Accounts Policies
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);

-- Expenses Policies
create policy "Users can view own expenses" on public.expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on public.expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on public.expenses for update using (auth.uid() = user_id);

-- Transactions Policies
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- Goals Policies
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, automatically create their profile row
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, handle)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
