import { NextResponse } from "next/server";
import { startOAuth, PLATFORMS, type Platform } from "@/lib/uploadpost";

// Returns the platform's own login link for one profile. After she authorizes, Upload-Post
// sends her back to /accounts with the profile name and the result in the URL.
export async function POST(req: Request) {
  const { username, platform } = (await req.json().catch(() => ({}))) as { username?: string; platform?: string };
  if (!username || !PLATFORMS.includes(platform as Platform))
    return NextResponse.json({ error: "Missing profile or platform." }, { status: 400 });
  try {
    const back = new URL("/accounts", req.url);
    back.searchParams.set("profile", username);
    const url = await startOAuth({ username, platform: platform as Platform, redirectUrl: back.toString() });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
