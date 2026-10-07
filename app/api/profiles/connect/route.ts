import { NextResponse } from "next/server";
import { connectLink, PLATFORMS, type Platform } from "@/lib/uploadpost";

// Returns a one-time link that opens Upload-Post's login page for one platform on one profile.
export async function POST(req: Request) {
  const { username, platform } = (await req.json().catch(() => ({}))) as { username?: string; platform?: string };
  if (!username || !PLATFORMS.includes(platform as Platform))
    return NextResponse.json({ error: "Missing profile or platform." }, { status: 400 });
  try {
    const url = await connectLink({
      username,
      platform: platform as Platform,
      redirectUrl: new URL("/accounts", req.url).toString(),
    });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
