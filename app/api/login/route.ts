import { NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, makeSession } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const ok = await checkPassword(String(form.get("password") ?? ""));
  const res = NextResponse.redirect(new URL(ok ? "/" : "/login?error=1", req.url), 303);
  if (ok) {
    const s = await makeSession();
    res.cookies.set(SESSION_COOKIE, s.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: s.maxAge,
    });
  }
  return res;
}
