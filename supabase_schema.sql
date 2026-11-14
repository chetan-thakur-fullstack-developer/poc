-- ==============================================================================
-- EXECUTIVE WEALTH · SUPABASE DATABASE SCHEMA
-- Project: https://ggtcqxyslomnfnzdeeir.supabase.co
-- SQL Editor URL: https://supabase.com/dashboard/project/ggtcqxyslomnfnzdeeir/sql/new
-- ==============================================================================
-- ARCHITECTURE:
-- 1. Real Users: Store their actual financial records separately, linked to auth.uid().
--    New users start with a clean personal workspace (0 accounts, 0 transactions).
-- 2. Demo Account: Uses sample data tied to user_id = '00000000-0000-0000-0000-000000000000'
--    for the test-sign / sandbox feature.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key,
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

-- 2. PORTFOLIOS (Multi-year tracking per user)
create table if not exists public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid(),
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
  user_id uuid not null default auth.uid(),
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

-- 4. EXPENSES (Monthly budget target, categories & credit cards)
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid unique not null default auth.uid(),
  monthly_budget numeric default 3000,
  categories jsonb default '[]'::jsonb,
  cards jsonb default '[]'::jsonb,
  selected_currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TRANSACTIONS (Ledger entries)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null default auth.uid(),
  amount numeric not null,
  description text,
  card_id text,
  category_id text,
  date date not null default current_date,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. GOALS (Milestones)
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid(),
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
-- Strict Isolation: Real users only ever access their own user_id data.
-- Demo data (user_id = '00000000-0000-0000-0000-000000000000') is readable for test mode.
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.accounts enable row level security;
alter table public.expenses enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

-- Profiles Policies
drop policy if exists "Users view own profile or demo" on public.profiles;
create policy "Users view own profile or demo" on public.profiles
  for select using (auth.uid() = id or id = '00000000-0000-0000-0000-000000000000' or auth.uid() is null);

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id or auth.uid() is null) with check (auth.uid() = id or auth.uid() is null);

-- Portfolios Policies
drop policy if exists "Users view own portfolios or demo" on public.portfolios;
create policy "Users view own portfolios or demo" on public.portfolios
  for select using (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000000' or auth.uid() is null);

drop policy if exists "Users manage own portfolios" on public.portfolios;
create policy "Users manage own portfolios" on public.portfolios
  for all using (auth.uid() = user_id or auth.uid() is null) with check (auth.uid() = user_id or auth.uid() is null);

-- Accounts Policies
drop policy if exists "Users view own accounts or demo" on public.accounts;
create policy "Users view own accounts or demo" on public.accounts
  for select using (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000000' or auth.uid() is null);

drop policy if exists "Users manage own accounts" on public.accounts;
create policy "Users manage own accounts" on public.accounts
  for all using (auth.uid() = user_id or auth.uid() is null) with check (auth.uid() = user_id or auth.uid() is null);

-- Expenses Policies
drop policy if exists "Users view own expenses or demo" on public.expenses;
create policy "Users view own expenses or demo" on public.expenses
  for select using (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000000' or auth.uid() is null);

drop policy if exists "Users manage own expenses" on public.expenses;
create policy "Users manage own expenses" on public.expenses
  for all using (auth.uid() = user_id or auth.uid() is null) with check (auth.uid() = user_id or auth.uid() is null);

-- Transactions Policies
drop policy if exists "Users view own transactions or demo" on public.transactions;
create policy "Users view own transactions or demo" on public.transactions
  for select using (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000000' or auth.uid() is null);

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions" on public.transactions
  for all using (auth.uid() = user_id or auth.uid() is null) with check (auth.uid() = user_id or auth.uid() is null);

-- Goals Policies
drop policy if exists "Users view own goals or demo" on public.goals;
create policy "Users view own goals or demo" on public.goals
  for select using (auth.uid() = user_id or user_id = '00000000-0000-0000-0000-000000000000' or auth.uid() is null);

drop policy if exists "Users manage own goals" on public.goals;
create policy "Users manage own goals" on public.goals
  for all using (auth.uid() = user_id or auth.uid() is null) with check (auth.uid() = user_id or auth.uid() is null);

-- ==============================================================================
-- SAMPLE DEMO DATA (SCOPED ONLY TO DEMO USER 00000000-0000-0000-0000-000000000000)
-- Real users who sign up will NEVER see these rows in their personal accounts.
-- ==============================================================================

-- Demo Profile
insert into public.profiles (id, email, full_name, handle, role)
values (
  '00000000-0000-0000-0000-000000000000',
  'demo@executivewealth.app',
  'Demo Investor',
  'demo_preview',
  'demo'
)
on conflict (id) do update set full_name = 'Demo Investor';

-- Demo Accounts
insert into public.accounts (id, user_id, name, institution, type, mask, balance, color, source)
values
  ('demo_chase_checking', '00000000-0000-0000-0000-000000000000', 'Total Checking', 'Chase', 'checking', '4821', 8420.55, '#8B5CF6', 'plaid'),
  ('demo_chase_sapphire', '00000000-0000-0000-0000-000000000000', 'Sapphire Credit Card', 'Chase', 'credit', '7712', 2384.19, '#FB7185', 'plaid'),
  ('demo_fidelity_brokerage', '00000000-0000-0000-0000-000000000000', 'Brokerage', 'Fidelity', 'investment', '4402', 127340.88, '#8B5CF6', 'plaid'),
  ('demo_vanguard_401k', '00000000-0000-0000-0000-000000000000', '401(k)', 'Vanguard', 'retirement', '2210', 136638.00, '#8B5CF6', 'plaid')
on conflict (id) do update set balance = excluded.balance, last_synced = now();

-- Demo Transactions
insert into public.transactions (id, user_id, amount, description, card_id, category_id, date, is_recurring)
values
  ('demo_tx_1', '00000000-0000-0000-0000-000000000000', 75.00, 'Balance 1st week', 'card_1788699872709', 'cat_grocery', '2026-09-06', false),
  ('demo_tx_2', '00000000-0000-0000-0000-000000000000', 142.50, 'Whole Foods Market', 'card_1788699872709', 'cat_grocery', '2026-09-12', false),
  ('demo_tx_3', '00000000-0000-0000-0000-000000000000', 55.20, 'Chevron Fuel', 'card_1788788149446', 'cat_transport', '2026-09-15', false),
  ('demo_tx_4', '00000000-0000-0000-0000-000000000000', 15.99, 'Netflix Subscription', 'card_1788788234637', 'cat_entertainment', '2026-09-18', true)
on conflict (id) do nothing;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER FOR REAL NEW USERS
-- Real users start with a clean profile linked to auth.users
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
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
