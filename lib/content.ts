// Captions, hashtags and per-profile details. All stored in Supabase (see the supabase/ folder).
import { insert, remove, select, update, upsert } from "./db.ts";
import type { Platform } from "./uploadpost.ts";

export type Caption = { id: number; text: string; active: boolean };

export type Hashtag = {
  id: number;
  clip: number | null; // 1 to 5, or null for any clip
  tag: string;
  tiktok: boolean;
  instagram: boolean;
  youtube: boolean;
  facebook: boolean;
};

export type ProfileDetails = { username: string; facebook_page_id: string | null };

// ---- Captions ----
export const listCaptions = () => select<Caption>("captions", "select=id,text,active&order=id.asc");

export const addCaption = (text: string) => insert("captions", { text });

export const setCaptionActive = (id: number, active: boolean) => update("captions", `id=eq.${id}`, { active });

export const deleteCaption = (id: number) => remove("captions", `id=eq.${id}`);

// ---- Hashtags ----
export const listHashtags = () =>
  select<Hashtag>("hashtags", "select=id,clip,tag,tiktok,instagram,youtube,facebook&order=clip.asc.nullsfirst,id.asc");

export const addHashtag = (clip: number | null, tag: string, platforms: Platform[]) =>
  insert("hashtags", {
    clip,
    tag,
    tiktok: platforms.includes("tiktok"),
    instagram: platforms.includes("instagram"),
    youtube: platforms.includes("youtube"),
    facebook: platforms.includes("facebook"),
  });

export const setHashtagPlatforms = (id: number, platforms: Platform[]) =>
  update("hashtags", `id=eq.${id}`, {
    tiktok: platforms.includes("tiktok"),
    instagram: platforms.includes("instagram"),
    youtube: platforms.includes("youtube"),
    facebook: platforms.includes("facebook"),
  });

export const deleteHashtag = (id: number) => remove("hashtags", `id=eq.${id}`);

// ---- Profile details ----
export const listProfileDetails = () =>
  select<ProfileDetails>("profile_settings", "select=username,facebook_page_id");

export const setFacebookPageId = (username: string, pageId: string | null) =>
  upsert(
    "profile_settings",
    { username, facebook_page_id: pageId, updated_at: new Date().toISOString() },
    "username",
  );
