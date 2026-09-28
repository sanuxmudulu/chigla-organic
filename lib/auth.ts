// Single-user password login. Session = signed expiry timestamp in a cookie. Fails closed.
export const SESSION_COOKIE = "session";
const MAX_AGE_S = 60 * 60 * 24 * 14;
const enc = new TextEncoder();

async function sign(msg: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function checkPassword(input: string): Promise<boolean> {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw || !process.env.SESSION_SECRET) return false;
  // Compare HMACs so length differences do not leak.
  return safeEqual(await sign("pw:" + input), await sign("pw:" + pw));
}

export async function makeSession(): Promise<{ value: string; maxAge: number }> {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE_S);
  return { value: `${exp}.${await sign(exp)}`, maxAge: MAX_AGE_S };
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(exp));
}

export async function isAuthed(req: Request): Promise<boolean> {
  const m = /(?:^|;\s*)session=([^;]+)/.exec(req.headers.get("cookie") ?? "");
  return verifySession(m?.[1]);
}
