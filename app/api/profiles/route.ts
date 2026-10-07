import { NextResponse } from "next/server";
import { createProfile } from "@/lib/uploadpost";

const NAME = /^[A-Za-z0-9_@-]{2,60}$/;

// Create a profile (one slot in Upload-Post). Deleting profiles is not exposed here on purpose.
export async function POST(req: Request) {
  const { username } = (await req.json().catch(() => ({}))) as { username?: string };
  if (!username || !NAME.test(username.trim()))
    return NextResponse.json(
      { error: "Use 2-60 letters, numbers, underscores, hyphens or @. No spaces." },
      { status: 400 },
    );
  try {
    const r = await createProfile(username.trim());
    if (!r.ok) return NextResponse.json({ error: r.message ?? "Upload-Post could not create the profile." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
