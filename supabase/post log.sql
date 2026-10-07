-- Post log: one row per scheduled post per platform.
--
-- Purpose: records what happened to every post the poster sent to Upload-Post, so the
--          Schedule page can show yellow (not posted yet), green (posted) or red (failed).
-- Volume:  25 posts x 4 platforms = 100 rows per day.
-- Writes:  the poster (server) only. It uses the secret key, which bypasses row-level security.
-- Reads:   the Schedule page (server) only. Nothing in the browser can read or write this table.
--
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table public.post_log (
  id bigint generated always as identity primary key,
  post_date date not null,                      -- New York date of the post, e.g. 2026-10-07
  post_number smallint not null,                -- 1 to 25, the post's number for that day
  platform text not null
    check (platform in ('tiktok', 'instagram', 'youtube', 'facebook')),
  profile text not null,                        -- Upload-Post profile name the post went from
  scheduled_for timestamptz not null,           -- the exact time the post was due
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  upload_request_id text,                       -- Upload-Post request id, for checking status later
  error text,                                   -- the error message when status is 'failed'
  updated_at timestamptz not null default now(),
  unique (post_date, post_number, platform)     -- one row per post per platform, no duplicates
);

-- Lock the table. With row-level security on and no policies, the public (anon) key cannot
-- read or write it. Only the secret key used by the server can.
alter table public.post_log enable row level security;
