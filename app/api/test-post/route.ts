import { NextResponse } from "next/server";
import { downloadFile } from "@/lib/drive";
import { PLATFORMS, buildFields, uploadVideo, type Platform } from "@/lib/uploadpost";

export const maxDuration = 300;

type Body = {
  fileId: string;
  fileName: string;
  platforms: Platform[];
  title: string;
  facebookPageId?: string;
  tiktokPrivacy?: string;
  youtubePrivacy?: string;
  dryRun?: boolean;
};

// Test endpoint: downloads one Drive video and posts it to the chosen platforms now.
// Test posts are private by default (TikTok SELF_ONLY, YouTube private).
export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  b.tiktokPrivacy ??= "SELF_ONLY";
  b.youtubePrivacy ??= "private";
  const user = process.env.UPLOAD_POST_USER;
  const platforms = (b.platforms ?? []).filter((p) => PLATFORMS.includes(p));
  if (!b.fileId || platforms.length === 0 || !b.title?.trim())
    return NextResponse.json({ error: "Pick a video, at least one platform, and a caption" }, { status: 400 });
  if (!user) return NextResponse.json({ error: "UPLOAD_POST_USER is not set in .env.local" }, { status: 400 });

  try {
    const input = { ...b, user, platforms, async: true };
    const fields = buildFields(input);
    if (b.dryRun) return NextResponse.json({ dryRun: true, sentToUploadPost: false, fields, video: b.fileName });
    if (!process.env.UPLOAD_POST_API_KEY)
      return NextResponse.json({ error: "UPLOAD_POST_API_KEY is not set in .env.local" }, { status: 400 });
    const video = await downloadFile(b.fileId);
    const result = await uploadVideo(input, video, b.fileName || "video.mp4");
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
