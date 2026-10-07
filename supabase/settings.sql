-- Settings: the dashboard's editable values, one row per setting.
--
-- Purpose: session times, stagger, posting on/off, privacy defaults, and how many hashtags to
--          pick per platform. The Settings page reads and writes this table.
-- Writes:  the Settings page (server, secret key). Nothing in the browser can touch it.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table public.settings (
  key text primary key,                 -- e.g. 'session_times'
  value jsonb not null,                 -- the setting's value, stored as JSON
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Starting values. Safe to run again: existing rows are left alone.
insert into public.settings (key, value) values
  ('session_times', '["07:00","10:00","13:00","18:00","21:00"]'),  -- New York time, HH:MM, max 5
  ('stagger_minutes', '5'),                                         -- gap between accounts in a session
  ('posting_enabled', 'true'),                                      -- false pauses all posting
  ('tiktok_privacy', '"SELF_ONLY"'),                                -- SELF_ONLY = only you can see it
  ('youtube_privacy', '"private"'),                                 -- private | unlisted | public
  ('tags_per_platform', '{"tiktok":3,"instagram":3,"youtube":3,"facebook":3}')
on conflict (key) do nothing;
