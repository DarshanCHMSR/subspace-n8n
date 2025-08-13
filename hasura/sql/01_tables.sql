-- Enable UUID generation extension
create extension if not exists pgcrypto;

-- Chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'New Chat',
  created_at timestamptz not null default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Add FK to Nhost auth.users (check first if it doesn't exist)
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'chats_user_fkey'
      and table_name = 'chats'
      and table_schema = 'public'
  ) then
    alter table public.chats
      add constraint chats_user_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- Helpful index for message streams
create index if not exists messages_chat_created_at_idx 
on public.messages(chat_id, created_at);
