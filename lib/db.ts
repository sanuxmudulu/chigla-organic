// Small helper for Supabase's REST API. Server-only: it uses the secret key, which bypasses the
// table security rules. Never import this from a client component.

type Row = Record<string, unknown>;

export function dbReady(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

async function call<T>(method: string, path: string, body?: unknown, prefer?: string): Promise<T> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key)
    throw new Error("The database is not connected yet. Add SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel.");
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
