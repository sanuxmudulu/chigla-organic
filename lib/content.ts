// Captions, hashtags and per-profile details. All stored in Supabase (see the supabase/ folder).
import { insert, remove, select, update, upsert } from "./db.ts";

export type Caption = { id: number; text: string; active: boolean };
export type Hashtag = { id: number; tag: string; active: boolean };
export type ProfileDetails = { username: string; facebook_page_id: string | null };

// ---- Captions ----
export const listCaptions = () => select<Caption>("captions", "select=id,text,active&order=id.asc");

export const addCaption = (text: string) => insert("captions", { text });

export const setCaptionActive = (id: number, active: boolean) => update("captions", `id=eq.${id}`, { active });

export const deleteCaption = (id: number) => remove("captions", `id=eq.${id}`);

// ---- Hashtags ----
export const listHashtags = () => select<Hashtag>("hashtags", "select=id,tag,active&order=id.asc");

export const addHashtag = (tag: string) => insert("hashtags", { tag });

export const setHashtagActive = (id: number, active: boolean) => update("hashtags", `id=eq.${id}`, { active });

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
