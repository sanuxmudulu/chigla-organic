-- Profile settings: extra details the posting needs for each Upload-Post profile.
--
-- Purpose: the Facebook Page ID for each profile (Facebook posts need it). Profile names and
--          connected accounts come from Upload-Post, not from this table.
-- Writes:  the Accounts page (server, secret key) only.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table public.profile_settings (
  username text primary key,            -- must match the Upload-Post profile name
  facebook_page_id text,
  updated_at timestamptz not null default now()
);

alter table public.profile_settings enable row level security;
