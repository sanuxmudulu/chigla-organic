// Thin client for the Upload-Post REST API (https://docs.upload-post.com).
const BASE = "https://api.upload-post.com/api";

export type Platform = "tiktok" | "instagram" | "youtube" | "facebook";
export const PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "facebook"];

export type PostInput = {
  user: string; // Upload-Post profile name
  platforms: Platform[];
  title: string; // caption (also the YouTube title)
  description?: string;
  facebookPageId?: string; // required by Upload-Post when posting to Facebook
  tiktokPrivacy?: string; // e.g. PUBLIC_TO_EVERYONE | SELF_ONLY
  youtubePrivacy?: string; // public | unlisted | private
  scheduledDate?: string; // ISO-8601; omit to publish now
  timezone?: string;
  async?: boolean;
};

export function isConfigured(): boolean {
  return Boolean(process.env.UPLOAD_POST_API_KEY && process.env.UPLOAD_POST_USER);
}

// Form fields for POST /upload, without the video itself.
export function buildFields(i: PostInput): [string, string][] {
  const f: [string, string][] = [["user", i.user]];
  for (const p of i.platforms) f.push(["platform[]", p]);
  f.push(["title", i.title]);
  if (i.description) f.push(["description", i.description]);
  if (i.platforms.includes("tiktok")) {
    f.push(["post_mode", "DIRECT_POST"]);
    if (i.tiktokPrivacy) f.push(["privacy_level", i.tiktokPrivacy]);
  }
  if (i.platforms.includes("youtube") && i.youtubePrivacy) f.push(["privacyStatus", i.youtubePrivacy]);
  if (i.platforms.includes("facebook")) {
    if (!i.facebookPageId) throw new Error("Facebook needs a Page ID (facebook_page_id)");
    f.push(["facebook_page_id", i.facebookPageId]);
  }
  if (i.scheduledDate) {
    f.push(["scheduled_date", i.scheduledDate]);
    if (i.timezone) f.push(["timezone", i.timezone]);
  }
  if (i.async) f.push(["async_upload", "true"]);
  return f;
}

function authHeaders(): Record<string, string> {
  const key = process.env.UPLOAD_POST_API_KEY;
  if (!key) throw new Error("UPLOAD_POST_API_KEY is not set in .env.local");
  return { authorization: `Apikey ${key}` };
}

async function readBody(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function uploadVideo(i: PostInput, video: Blob, filename: string) {
  const form = new FormData();
  for (const [k, v] of buildFields(i)) form.append(k, v);
  form.append("video", video, filename);
  const res = await fetch(`${BASE}/upload`, { method: "POST", headers: authHeaders(), body: form });
  return { httpStatus: res.status, ok: res.ok, body: await readBody(res) };
}

export async function uploadStatus(requestId: string) {
  const url = `${BASE}/uploadposts/status?request_id=${encodeURIComponent(requestId)}`;
  const res = await fetch(url, { headers: authHeaders() });
  return { httpStatus: res.status, ok: res.ok, body: await readBody(res) };
}

// ---- Profiles (one profile = one set of accounts, one per platform) ----

export type SocialAccount = {
  username?: string;
  handle?: string;
  display_name?: string;
  social_images?: string;
  reauth_required?: boolean;
};

export type Profile = {
  username: string;
  created_at?: string;
  social_accounts: Partial<Record<Platform, SocialAccount | null | "">>;
};

type ApiJson = { success?: boolean; message?: string; [k: string]: unknown };

async function apiJson(path: string, init: RequestInit = {}): Promise<{ status: number; body: ApiJson }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.body ? { "content-type": "application/json" } : {}) },
    cache: "no-store",
  });
  const body = (await readBody(res)) as ApiJson;
  return { status: res.status, body: typeof body === "object" && body ? body : { success: false, message: String(body) } };
}

export async function listProfiles(): Promise<Profile[]> {
  const { status, body } = await apiJson("/uploadposts/users");
  if (!Array.isArray(body.profiles)) throw new Error(body.message ?? `Upload-Post profile list failed (${status})`);
  return body.profiles as Profile[];
}

export async function createProfile(username: string): Promise<{ ok: boolean; message?: string }> {
  const { status, body } = await apiJson("/uploadposts/users", { method: "POST", body: JSON.stringify({ username }) });
  return { ok: status < 300 && body.success !== false, message: body.message };
}

// Direct OAuth start for one platform on one profile. Returns the platform's own login URL
// (Google for YouTube, Meta for Instagram/Facebook, ...). It expires after 15 minutes.
export async function startOAuth(opts: { username: string; platform: Platform; redirectUrl: string }) {
  const { status, body } = await apiJson(`/uploadposts/oauth/${opts.platform}/start`, {
    method: "POST",
    body: JSON.stringify({ profile: opts.username, redirect_url: opts.redirectUrl }),
  });
  const url = body.authorize_url as string | undefined;
  if (!url) throw new Error(body.message ?? `Upload-Post did not return a login link (HTTP ${status})`);
  return url;
}
