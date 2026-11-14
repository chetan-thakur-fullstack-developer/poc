-- ==============================================================================
-- EXECUTIVE WEALTH · SUPABASE DATABASE SCHEMA & SEED DATA
-- Project: https://ggtcqxyslomnfnzdeeir.supabase.co
-- SQL Editor URL: https://supabase.com/dashboard/project/ggtcqxyslomnfnzdeeir/sql/new
-- ==============================================================================
-- INSTRUCTIONS FOR SETUP:
-- 1. Go to: https://supabase.com/dashboard/project/ggtcqxyslomnfnzdeeir/sql/new
-- 2. Paste this entire script into the query editor.
-- 3. Click "Run" (or press Cmd+Enter / Ctrl+Enter).
-- 4. All tables, security policies, triggers, and seed data will be created!
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

-- 2. PORTFOLIOS (Multi-year tracking: 2023-2026)
create table if not exists public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
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
  user_id uuid references auth.users on delete cascade,
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
  user_id uuid references auth.users on delete cascade,
  monthly_budget numeric default 3000,
  categories jsonb default '[]'::jsonb,
  cards jsonb default '[]'::jsonb,
  selected_currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TRANSACTIONS (Ledger)
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
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
  user_id uuid references auth.users on delete cascade,
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
-- Uses DROP POLICY IF EXISTS before CREATE POLICY to ensure safe re-runs anytime
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.accounts enable row level security;
alter table public.expenses enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

-- Profiles Policies
drop policy if exists "Allow all operations on profiles" on public.profiles;
create policy "Allow all operations on profiles" on public.profiles for all using (true) with check (true);

-- Portfolios Policies
drop policy if exists "Allow all operations on portfolios" on public.portfolios;
create policy "Allow all operations on portfolios" on public.portfolios for all using (true) with check (true);

-- Accounts Policies
drop policy if exists "Allow all operations on accounts" on public.accounts;
create policy "Allow all operations on accounts" on public.accounts for all using (true) with check (true);

-- Expenses Policies
drop policy if exists "Allow all operations on expenses" on public.expenses;
create policy "Allow all operations on expenses" on public.expenses for all using (true) with check (true);

-- Transactions Policies
drop policy if exists "Allow all operations on transactions" on public.transactions;
create policy "Allow all operations on transactions" on public.transactions for all using (true) with check (true);

-- Goals Policies
drop policy if exists "Allow all operations on goals" on public.goals;
create policy "Allow all operations on goals" on public.goals for all using (true) with check (true);

-- ==============================================================================
-- SEED INITIAL DATA (PORTFOLIO, ACCOUNTS, EXPENSES)
-- ==============================================================================

-- Seed Accounts
insert into public.accounts (id, name, institution, type, mask, balance, color, source)
values
  ('plaid_chase_checking', 'Total Checking', 'Chase', 'checking', '4821', 8420.55, '#8B5CF6', 'plaid'),
  ('plaid_chase_sapphire', 'Sapphire Credit Card', 'Chase', 'credit', '7712', 2384.19, '#FB7185', 'plaid'),
  ('plaid_fidelity_brokerage', 'Brokerage', 'Fidelity', 'investment', '4402', 127340.88, '#8B5CF6', 'plaid'),
  ('plaid_vanguard_401k', '401(k)', 'Vanguard', 'retirement', '2210', 136638.00, '#8B5CF6', 'plaid')
on conflict (id) do update set
  balance = excluded.balance,
  last_synced = now();

-- Seed Transactions
insert into public.transactions (id, amount, description, card_id, category_id, date, is_recurring)
values
  ('tx_1788699895167', 75.00, 'Balance 1st week', 'card_1788699872709', 'cat_1788788872263', '2026-09-06', false),
  ('tx_1788699895168', 142.50, 'Whole Foods Market', 'card_1788699872709', 'cat_1788788872263', '2026-09-12', false),
  ('tx_1788699895169', 55.20, 'Chevron Fuel', 'card_1788788149446', 'cat_1788788872264', '2026-09-15', false),
  ('tx_1788699895170', 15.99, 'Netflix Subscription', 'card_1788788234637', 'cat_1788788872265', '2026-09-18', true)
on conflict (id) do nothing;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
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
