import { NextResponse } from "next/server";
import { uploadStatus } from "@/lib/uploadpost";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("request_id");
  if (!id) return NextResponse.json({ error: "request_id required" }, { status: 400 });
  try {
    return NextResponse.json(await uploadStatus(id));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
