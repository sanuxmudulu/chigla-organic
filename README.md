# Chigla Organic

A simple dashboard for posting the organic videos to TikTok, Instagram, YouTube and Facebook.

## Pages

- **Today**: how many videos are ready, how many posts go out today, and when the next one is.
- **Videos**: the clip folders in Google Drive and which hook videos are missing.
- **Schedule**: today's posts, grouped by session.
- **Send a test**: send one video to the accounts as a private test post.

## Setup

Set these in `.env.local` locally, and in the Vercel project settings for the live site:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`: the Google service account that can read the `Content` Drive folder
- `UPLOAD_POST_API_KEY`, `UPLOAD_POST_USER`: the Upload-Post key and profile name

Drive layout: one folder named `Content`, shared with the service account, containing `Clip1` to `Clip5`. Each clip folder holds 5 videos, sorted by name (the first is hook 1).

## Running

```bash
npm install
npm run dev
```

Open http://localhost:3000.
