"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/settings";
import { PLATFORMS, type Platform } from "@/lib/uploadpost";
import { saveSettingsAction } from "../actions";
import { Card } from "../ui";

const LABEL: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };
const field = "rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-base outline-none focus:border-indigo-500";
const TIKTOK = [
  ["SELF_ONLY", "Only me (test)"],
  ["PUBLIC_TO_EVERYONE", "Public"],
  ["MUTUAL_FOLLOW_FRIENDS", "Friends"],
  ["FOLLOWER_OF_CREATOR", "Followers"],
];
const YOUTUBE = [
  ["private", "Private"],
  ["unlisted", "Unlisted"],
  ["public", "Public"],
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const r = await saveSettingsAction(s);
      if (!r.ok) setError(r.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card title="Posting times">
        <div className="space-y-3">
          {s.sessionTimes.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 text-sm text-stone-500">Session {i + 1}</span>
              <input
                type="time"
                value={t}
                onChange={(e) =>
                  setS({ ...s, sessionTimes: s.sessionTimes.map((x, j) => (j === i ? e.target.value : x)) })
                }
                className={field}
              />
              {s.sessionTimes.length > 1 && (
                <button
                  onClick={() => setS({ ...s, sessionTimes: s.sessionTimes.filter((_, j) => j !== i) })}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {s.sessionTimes.length < 5 && (
            <button
              onClick={() => setS({ ...s, sessionTimes: [...s.sessionTimes, "12:00"] })}
              className="rounded-full border border-dashed border-stone-400 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
            >
              + Add a session
            </button>
          )}
        </div>
        <label className="mt-6 flex flex-wrap items-center gap-3 text-base text-stone-700">
          Gap between accounts in one session
          <input
            type="number"
            min={0}
            max={30}
            value={s.staggerMinutes}
            onChange={(e) => setS({ ...s, staggerMinutes: Number(e.target.value) })}
            className={`${field} w-24`}
          />
          minutes
        </label>
      </Card>

      <Card title="Posting">
        <label className="flex items-center gap-3 text-base text-stone-800">
          <input
            type="checkbox"
            checked={s.postingEnabled}
            onChange={(e) => setS({ ...s, postingEnabled: e.target.checked })}
          />
          Posting is on
        </label>
        <p className="mt-2 text-sm text-stone-500">Turn this off to stop every post without changing the schedule.</p>
      </Card>

      <Card title="Privacy for new posts">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-stone-600">
            TikTok
            <select value={s.tiktokPrivacy} onChange={(e) => setS({ ...s, tiktokPrivacy: e.target.value })} className={`${field} block w-full`}>
              {TIKTOK.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-stone-600">
            YouTube
            <select value={s.youtubePrivacy} onChange={(e) => setS({ ...s, youtubePrivacy: e.target.value })} className={`${field} block w-full`}>
              {YOUTUBE.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card title="Hashtags per post">
        <div className="grid gap-4 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <label key={p} className="flex items-center justify-between gap-3 text-base text-stone-700">
              {LABEL[p]}
              <input
                type="number"
                min={0}
                max={10}
                value={s.tagsPerPlatform[p]}
                onChange={(e) => setS({ ...s, tagsPerPlatform: { ...s.tagsPerPlatform, [p]: Number(e.target.value) } })}
                className={`${field} w-24`}
              />
            </label>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save settings"}
        </button>
        {saved && <span className="text-sm text-emerald-700 dark:text-emerald-300">Saved.</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
