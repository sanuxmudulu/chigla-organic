import { loadClips } from "@/lib/clips";
import { DEFAULT_SCHEDULE as S, todayIn } from "@/lib/config";
import { getSettings } from "@/lib/settings";
import { getPostStatuses } from "@/lib/post-log";
import { buildPlan } from "@/lib/schedule";
import { Card, PageHeader, Pill } from "./ui";
import { Countdown } from "./live";
import { DaySessions } from "./sessions";

const TIME = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, hour: "numeric", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("en-US", { timeZone: S.timeZone, weekday: "long", day: "numeric", month: "long" });

export default async function TodayPage() {
  const today = todayIn(S.timeZone);
  const [{ clips, error: driveError }, { settings, error: dbError }, { statuses, error: logError }] = await Promise.all([
    loadClips(),
    getSettings(),
    getPostStatuses(today),
  ]);

  const videos = clips.reduce((n, c) => n + c.videos.length, 0);
  const expected = S.clips * S.hooks;
  const allReady = videos === expected && !driveError;

  const plan = buildPlan({ ...S, sessionTimes: settings.sessionTimes, staggerMinutes: settings.staggerMinutes }, today, 1);
  // The page is dynamic (see layout's connection()), so reading the clock per request is intended.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const nextIndex = plan.findIndex((p) => Date.parse(p.publishAt) > now);
  const next = nextIndex === -1 ? null : plan[nextIndex];

  const notices = [driveError && `Google Drive: ${driveError}`, dbError && `Database: ${dbError}`, logError && `Post log: ${logError}`].filter(Boolean);

  return (
    <>
      <PageHeader title="Today" sub={`${DAY.format(new Date())} · New York time`} />

      {notices.length > 0 && (
        <div className="space-y-1 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          {notices.map((n) => (
            <p key={n as string}>{n}</p>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Videos ready">
          <div className="text-4xl font-semibold text-stone-900">
            {videos} <span className="text-2xl text-stone-400">/ {expected}</span>
          </div>
          <div className="mt-4">
            {driveError ? (
              <Pill ok={false}>Can&apos;t reach Google Drive</Pill>
            ) : allReady ? (
              <Pill ok>All videos ready</Pill>
            ) : (
              <Pill ok={false}>{expected - videos} still missing</Pill>
            )}
          </div>
        </Card>

        <Card title="Next post">
          {!settings.postingEnabled ? (
            <p className="text-lg text-stone-700">Posting is paused in Settings.</p>
          ) : next ? (
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

      <DaySessions
        today={today}
        sessionTimes={settings.sessionTimes}
        staggerMinutes={settings.staggerMinutes}
        statuses={statuses}
      />
    </>
  );
}
