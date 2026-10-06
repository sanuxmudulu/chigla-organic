import Link from "next/link";
import { loadClips } from "@/lib/clips";
import { DEFAULT_SCHEDULE as S, todayIn } from "@/lib/config";
import { buildPlan } from "@/lib/schedule";
import { isConfigured } from "@/lib/uploadpost";
import { Card, PageHeader, Pill } from "./ui";

const TIME = (tz: string) => new Intl.DateTimeFormat("en-AU", { timeZone: tz, hour: "numeric", minute: "2-digit" });
const DAY = (tz: string) => new Intl.DateTimeFormat("en-AU", { timeZone: tz, weekday: "long", day: "numeric", month: "long" });

export default async function TodayPage() {
  const { clips, error } = await loadClips();
  const videos = clips.reduce((n, c) => n + c.videos.length, 0);
  const expected = S.clips * S.hooks;
  const allReady = videos === expected && !error;
  const configured = isConfigured();

  const plan = buildPlan(S, todayIn(S.timeZone), 1);
  // The page is dynamic (see layout's connection()), so reading the clock per request is intended.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const next = plan.find((p) => Date.parse(p.publishAt) > now);
  const postsPerSession = S.accounts;

  return (
    <>
      <PageHeader title="Today" sub={DAY(S.timeZone).format(new Date())} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Videos ready">
          <div className="text-4xl font-semibold text-stone-900">
            {videos} <span className="text-2xl text-stone-400">/ {expected}</span>
          </div>
          <div className="mt-4">
            {error ? (
              <Pill ok={false}>Can&apos;t reach Google Drive</Pill>
            ) : allReady ? (
              <Pill ok>All videos ready</Pill>
            ) : (
              <Pill ok={false}>{expected - videos} still missing</Pill>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        <Card title="Posts today">
          <div className="text-4xl font-semibold text-stone-900">{plan.length}</div>
          <p className="mt-3 text-sm text-stone-500">
            {S.sessionTimes.length} sessions of {postsPerSession} posts. Each post goes to TikTok, Instagram, YouTube
            and Facebook.
          </p>
        </Card>

        <Card title="Next post">
          {next ? (
            <>
              <div className="text-4xl font-semibold text-stone-900">
                {TIME(S.timeZone).format(new Date(next.publishAt))}
              </div>
              <p className="mt-3 text-sm text-stone-500">
                Account {next.account + 1}, clip {next.clip + 1}, hook {next.hook + 1}
              </p>
            </>
          ) : (
            <p className="text-lg text-stone-700">No more posts today.</p>
          )}
        </Card>
      </div>

      <Card title="Before the posts go out">
        <ul className="space-y-3 text-base">
          <li className="flex items-start gap-3">
            <Pill ok={allReady}>{allReady ? "Done" : "To do"}</Pill>
            <span>
              Each clip folder in Google Drive has {S.hooks} videos ({expected} in total).
              <Link href="/content" className="ml-1 text-indigo-600 underline">
                Check the videos
              </Link>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Pill ok={configured}>{configured ? "Done" : "To do"}</Pill>
            <span>The posting account is connected to the app.</span>
          </li>
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/schedule" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
          See today&apos;s schedule
        </Link>
        <Link href="/test-post" className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100">
          Send a test post
        </Link>
      </div>
    </>
  );
}
