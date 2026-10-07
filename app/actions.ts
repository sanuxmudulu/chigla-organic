"use server";

// Everything the dashboard can change. Each function checks its input, then writes to Supabase.
import { saveSettings, type Settings } from "@/lib/settings";
import {
  addCaption,
  addHashtag,
  deleteCaption,
  deleteHashtag,
  setCaptionActive,
  setFacebookPageId,
  setHashtagPlatforms,
} from "@/lib/content";
import { PLATFORMS, type Platform } from "@/lib/uploadpost";

export type Result = { ok: true } | { ok: false; error: string };

async function run(work: () => Promise<unknown>): Promise<Result> {
  try {
    await work();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const isId = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n > 0;
const isPlatforms = (p: unknown): p is Platform[] =>
  Array.isArray(p) && p.every((x) => PLATFORMS.includes(x as Platform));

// ---- Settings ----
export async function saveSettingsAction(s: Settings): Promise<Result> {
  if (!Array.isArray(s.sessionTimes) || s.sessionTimes.length < 1 || s.sessionTimes.length > 5)
    return { ok: false, error: "Use between 1 and 5 posting sessions." };
  if (!s.sessionTimes.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
    return { ok: false, error: "Every session needs a time." };
  if (!Number.isInteger(s.staggerMinutes) || s.staggerMinutes < 0 || s.staggerMinutes > 30)
    return { ok: false, error: "The gap between accounts must be 0 to 30 minutes." };
  if (!["SELF_ONLY", "PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR"].includes(s.tiktokPrivacy))
    return { ok: false, error: "Pick a valid TikTok privacy setting." };
  if (!["private", "unlisted", "public"].includes(s.youtubePrivacy))
    return { ok: false, error: "Pick a valid YouTube privacy setting." };
  for (const p of PLATFORMS) {
    const n = s.tagsPerPlatform[p];
    if (!Number.isInteger(n) || n < 0 || n > 10) return { ok: false, error: "Hashtags per platform must be 0 to 10." };
  }
  return run(() => saveSettings(s));
}

// ---- Captions ----
export async function addCaptionAction(text: string): Promise<Result> {
  const t = text.trim();
  if (t.length < 1) return { ok: false, error: "Write a caption first." };
  if (t.length > 2200) return { ok: false, error: "Captions can be at most 2200 characters." };
  return run(() => addCaption(t));
}

export async function setCaptionActiveAction(id: number, active: boolean): Promise<Result> {
  if (!isId(id)) return { ok: false, error: "Unknown caption." };
  return run(() => setCaptionActive(id, active));
}

export async function deleteCaptionAction(id: number): Promise<Result> {
  if (!isId(id)) return { ok: false, error: "Unknown caption." };
  return run(() => deleteCaption(id));
}

// ---- Hashtags ----
export async function addHashtagAction(clip: number | null, tag: string, platforms: Platform[]): Promise<Result> {
  if (clip !== null && !(Number.isInteger(clip) && clip >= 1 && clip <= 5))
    return { ok: false, error: "Clip must be 1 to 5, or all clips." };
  let t = tag.trim().replace(/\s+/g, "");
  if (!t) return { ok: false, error: "Write a hashtag first." };
  if (!t.startsWith("#")) t = `#${t}`;
  if (t.length < 2 || t.length > 100) return { ok: false, error: "Hashtags must be 1 to 99 characters." };
  if (!isPlatforms(platforms)) return { ok: false, error: "Unknown platform." };
  return run(() => addHashtag(clip, t, platforms));
}

export async function setHashtagPlatformsAction(id: number, platforms: Platform[]): Promise<Result> {
  if (!isId(id)) return { ok: false, error: "Unknown hashtag." };
  if (!isPlatforms(platforms)) return { ok: false, error: "Unknown platform." };
  return run(() => setHashtagPlatforms(id, platforms));
}

export async function deleteHashtagAction(id: number): Promise<Result> {
  if (!isId(id)) return { ok: false, error: "Unknown hashtag." };
  return run(() => deleteHashtag(id));
}

// ---- Profile details ----
export async function setFacebookPageAction(username: string, pageId: string): Promise<Result> {
  const id = pageId.trim();
  if (id && !/^\d{5,25}$/.test(id)) return { ok: false, error: "A Facebook Page ID is only digits." };
  if (!username) return { ok: false, error: "Unknown profile." };
  return run(() => setFacebookPageId(username, id || null));
}
