// Small helper for Supabase's REST API. Server-only: it uses the secret key, which bypasses the
// table security rules. Never import this from a client component.

type Row = Record<string, unknown>;

// Says what is wrong with the database setup, or null if it looks fine. Never shows the values.
export function dbProblem(): string | null {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const missing = [!base && "SUPABASE_URL", !key && "SUPABASE_SERVICE_KEY"].filter(Boolean);
  if (missing.length)
    return `The database isn't connected. This website can't see ${missing.join(" and ")}. Check the names in Vercel, make sure they're on Production, then redeploy.`;
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(base!.trim()))
    return "SUPABASE_URL should look like https://xxxx.supabase.co (the Project URL from Supabase).";
  if (key!.trim().startsWith("sb_publishable_"))
    return "SUPABASE_SERVICE_KEY holds the publishable key. Use the secret key instead (it starts with sb_secret_).";
  return null;
}

export function dbReady(): boolean {
  return dbProblem() === null;
}

async function call<T>(method: string, path: string, body?: unknown, prefer?: string): Promise<T> {
  const problem = dbProblem();
  if (problem) throw new Error(problem);
  const base = process.env.SUPABASE_URL!.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_KEY!.trim();
  const headers: Record<string, string> = {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
  };
  if (prefer) headers.prefer = prefer;
  const res = await fetch(`${base}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Database error ${res.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}

// Filters are PostgREST strings, e.g. "id=eq.5" or "post_date=eq.2026-10-07".
export const select = <T>(table: string, query: string) => call<T[]>("GET", `${table}?${query}`);

export const insert = <T>(table: string, row: Row) => call<T[]>("POST", table, row, "return=representation");

export const upsert = <T>(table: string, rows: Row | Row[], onConflict: string) =>
  call<T[]>("POST", `${table}?on_conflict=${onConflict}`, rows, "resolution=merge-duplicates,return=representation");

export const update = (table: string, filter: string, patch: Row) =>
  call<null>("PATCH", `${table}?${filter}`, patch, "return=minimal");

export const remove = (table: string, filter: string) =>
  call<null>("DELETE", `${table}?${filter}`, undefined, "return=minimal");
