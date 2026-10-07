-- Hashtags: one row per tag, with a switch for each platform.
--
-- Purpose: the Hashtags page. clip = 1 to 5 means the tag only goes with that clip's videos;
--          clip = null means it can go with any clip. The poster picks a random handful per
--          platform, using tags_per_platform from the settings table.
-- Writes:  the Hashtags page (server, secret key) only.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table public.hashtags (
  id bigint generated always as identity primary key,
  clip smallint check (clip between 1 and 5),   -- null = all clips
  tag text not null check (char_length(tag) between 2 and 100),  -- includes the #
  tiktok boolean not null default true,
  instagram boolean not null default true,
  youtube boolean not null default true,
  facebook boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hashtags enable row level security;
