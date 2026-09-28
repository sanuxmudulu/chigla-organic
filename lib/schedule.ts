// Pure scheduling logic: which video goes to which account in which session.
// No I/O, so it can be tested in isolation and reused by API routes.

export type ScheduleConfig = {
  accounts: number; // accounts per platform (each posts to all platforms at once)
  clips: number; // source clips (folders)
  hooks: number; // hook variants per clip (files per folder)
  sessionTimes: string[]; // "HH:MM" local times, one per daily session
  staggerMinutes: number; // gap between accounts within a session
  timeZone: string; // IANA zone, e.g. "Australia/Sydney"
};

export type Slot = {
  day: number; // day index within the cycle (0-based)
  session: number;
  account: number;
  clip: number;
  hook: number;
  publishAt: string; // ISO-8601 UTC
};

export function validateConfig(c: ScheduleConfig): void {
  if (c.clips < 2) throw new Error("Need at least 2 clips to avoid back-to-back repeats");
  if (c.accounts > c.clips)
    throw new Error("More accounts than clips: accounts in one session would share a clip");
  if (c.sessionTimes.length > c.hooks)
    throw new Error("More sessions per day than hook variants: hooks would repeat within a day");
  for (const t of c.sessionTimes)
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) throw new Error(`Bad session time "${t}"`);
}

// Clip rotates by +1 each session per account, so no account posts the same clip twice in
// a row (including across midnight when clips > 3). Hook depends on session+day, so every
// session uses a fresh hook variant and each (clip, hook) pair is used once per day.
export function slotFor(c: ScheduleConfig, day: number, session: number, account: number) {
  return {
    clip: (account + session + day) % c.clips,
    hook: (session + day) % c.hooks,
  };
}

// Offset (ms) of `timeZone` from UTC at the given instant.
function tzOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return asUtc - utcMs;
}

// Local wall-clock time in `timeZone` -> UTC ISO string. Handles DST by re-checking the offset.
export function zonedToUtcIso(date: string, time: string, timeZone: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi, 0);
  let utc = wall - tzOffsetMs(wall, timeZone);
  utc = wall - tzOffsetMs(utc, timeZone);
  return new Date(utc).toISOString().replace(".000Z", "Z");
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// Full plan for `days` days starting at local date `startDate` ("YYYY-MM-DD").
// `startDayIndex` lets a cycle continue rotation from a previous cycle instead of resetting.
export function buildPlan(
  c: ScheduleConfig,
  startDate: string,
  days: number,
  startDayIndex = 0,
): Slot[] {
  validateConfig(c);
  const out: Slot[] = [];
  for (let day = 0; day < days; day++) {
    const localDate = addDays(startDate, day);
    c.sessionTimes.forEach((time, session) => {
      for (let account = 0; account < c.accounts; account++) {
        const { clip, hook } = slotFor(c, startDayIndex + day, session, account);
        const base = zonedToUtcIso(localDate, time, c.timeZone);
        const publishAt = new Date(Date.parse(base) + account * c.staggerMinutes * 60_000)
          .toISOString()
          .replace(".000Z", "Z");
        out.push({ day, session, account, clip, hook, publishAt });
      }
    });
  }
  return out;
}
