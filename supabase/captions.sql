-- Captions: the caption / video description list. The poster picks one at random per post.
--
-- Purpose: the Captions page. Turn a caption off with active = false instead of deleting it.
-- Writes:  the Captions page (server, secret key) only.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table public.captions (
  id bigint generated always as identity primary key,
  text text not null check (char_length(text) between 1 and 2200),  -- TikTok's caption limit
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.captions enable row level security;
