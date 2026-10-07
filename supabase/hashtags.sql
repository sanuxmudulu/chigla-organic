-- Hashtags: one flat list. The same tags can go to every platform.
--
-- Purpose: the Text page (hashtags card). Turn a tag off with active = false instead of
--          deleting it. Each post gets a random selection from the active tags, using
--          tags_per_platform from the settings table.
-- Writes:  the Text page (server, secret key) only.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- If you already ran an older version of this file, run "drop table public.hashtags;" first.

create table public.hashtags (
  id bigint generated always as identity primary key,
  tag text not null check (char_length(tag) between 2 and 100),  -- includes the #
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hashtags enable row level security;
