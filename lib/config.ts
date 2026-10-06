import type { ScheduleConfig } from "./schedule.ts";

// Posting setup. Change these numbers here if the plan changes.
export const DEFAULT_SCHEDULE: ScheduleConfig = {
  accounts: 5,
  clips: 5,
  hooks: 5,
  sessionTimes: ["07:00", "10:00", "13:00", "18:00", "21:00"],
  staggerMinutes: 5,
  timeZone: "Australia/Sydney",
};

// Today's date (YYYY-MM-DD) in the posting timezone.
export function todayIn(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}
