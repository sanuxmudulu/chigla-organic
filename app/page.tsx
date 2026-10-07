import Link from "next/link";
import { loadClips } from "@/lib/clips";
import { DEFAULT_SCHEDULE as S, todayIn } from "@/lib/config";
import { buildPlan } from "@/lib/schedule";
import { Card, PageHeader, Pill } from "./ui";
import { Countdown } from "./live";

const TIME = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, weekday: "long", day: "numeric", month: "long" });

export default async function TodayPage() {
  const { clips, error } = await loadClips();
  const videos = clips.reduce((n, c) => n + c.videos.length, 0);
  const expected = S.clips * S.hooks;
  const allReady = videos === expected && !error;

  const plan = buildPlan(S, todayIn(S.timeZone), 1);
  // The page is dynamic (see layout's connection()), so reading the clock per request is intended.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const nextIndex = plan.findIndex((p) => Date.parse(p.publishAt) > now);
  const next = nextIndex === -1 ? null : plan[nextIndex];

  return (
    <>
      <PageHeader title="Today" sub={`${DAY.format(new Date())} · New York time`} />

      <div className="grid gap-4 md:grid-cols-2">
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

        <Card title="Next post">
          {next ? (
            <>
              <div className="text-4xl font-semibold text-stone-900">Post {nextIndex + 1}</div>
              <p className="mt-3 text-base text-stone-600">
                at {TIME.format(new Date(next.publishAt))} · starts in{" "}
                <span className="font-semibold text-stone-900">
                  <Countdown target={next.publishAt} />
                </span>
              </p>
            </>
          ) : (
            <p className="text-lg text-stone-700">No more posts today.</p>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/schedule" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500">
          See today&apos;s schedule
        </Link>
      </div>
    </>
  );
}
