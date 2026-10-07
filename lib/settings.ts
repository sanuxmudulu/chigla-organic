// The values the Settings page controls. Stored one row per setting in the `settings` table.
import { select, upsert } from "./db.ts";
import type { Platform } from "./uploadpost.ts";
import { DEFAULT_SCHEDULE } from "./config.ts";

export type Settings = {
  sessionTimes: string[]; // "HH:MM", New York time, 1 to 5 sessions
  staggerMinutes: number; // gap between accounts within one session
  postingEnabled: boolean; // false pauses all posting
  tiktokPrivacy: string; // SELF_ONLY | PUBLIC_TO_EVERYONE | MUTUAL_FOLLOW_FRIENDS | FOLLOWER_OF_CREATOR
  youtubePrivacy: string; // private | unlisted | public
  tagsPerPlatform: Record<Platform, number>; // how many random hashtags go on each platform's post
};

export const DEFAULT_SETTINGS: Settings = {
  sessionTimes: DEFAULT_SCHEDULE.sessionTimes,
  staggerMinutes: DEFAULT_SCHEDULE.staggerMinutes,
  postingEnabled: true,
  tiktokPrivacy: "SELF_ONLY",
  youtubePrivacy: "private",
  tagsPerPlatform: { tiktok: 3, instagram: 3, youtube: 3, facebook: 3 },
};

// Falls back to the defaults if the database is missing or unreachable, and says why.
export async function getSettings(): Promise<{ settings: Settings; error?: string }> {
  try {
    const rows = await select<{ key: string; value: unknown }>("settings", "select=key,value");
    const v = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const s: Settings = { ...DEFAULT_SETTINGS };
    if (Array.isArray(v.session_times)) s.sessionTimes = v.session_times as string[];
    if (typeof v.stagger_minutes === "number") s.staggerMinutes = v.stagger_minutes;
    if (typeof v.posting_enabled === "boolean") s.postingEnabled = v.posting_enabled;
    if (typeof v.tiktok_privacy === "string") s.tiktokPrivacy = v.tiktok_privacy;
    if (typeof v.youtube_privacy === "string") s.youtubePrivacy = v.youtube_privacy;
    if (v.tags_per_platform && typeof v.tags_per_platform === "object")
      s.tagsPerPlatform = { ...DEFAULT_SETTINGS.tagsPerPlatform, ...(v.tags_per_platform as Record<Platform, number>) };
    return { settings: s };
  } catch (e) {
    return { settings: DEFAULT_SETTINGS, error: (e as Error).message };
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await upsert(
    "settings",
    [
      { key: "session_times", value: s.sessionTimes, updated_at: new Date().toISOString() },
      { key: "stagger_minutes", value: s.staggerMinutes, updated_at: new Date().toISOString() },
      { key: "posting_enabled", value: s.postingEnabled, updated_at: new Date().toISOString() },
      { key: "tiktok_privacy", value: s.tiktokPrivacy, updated_at: new Date().toISOString() },
      { key: "youtube_privacy", value: s.youtubePrivacy, updated_at: new Date().toISOString() },
      { key: "tags_per_platform", value: s.tagsPerPlatform, updated_at: new Date().toISOString() },
    ],
    "key",
  );
}
