"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Hashtag } from "@/lib/content";
import { PLATFORMS, type Platform } from "@/lib/uploadpost";
import { addHashtagAction, deleteHashtagAction, setHashtagPlatformsAction } from "../actions";
import { Card } from "../ui";

const LABEL: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };
const field = "rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-base outline-none focus:border-indigo-500";

function enabled(t: Hashtag): Platform[] {
  return PLATFORMS.filter((p) => t[p]);
}

export function HashtagsEditor({ tags, perPlatform }: { tags: Hashtag[]; perPlatform: Record<Platform, number> }) {
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [clip, setClip] = useState<string>("all");
  const [platforms, setPlatforms] = useState<Platform[]>([...PLATFORMS]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(work: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) {
    setError(null);
    start(async () => {
      const r = await work();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
      else {
        onOk?.();
        router.refresh();
      }
    });
  }

  const groups: { key: string; title: string; clip: number | null }[] = [
    { key: "all", title: "All clips", clip: null },
    ...[1, 2, 3, 4, 5].map((n) => ({ key: `c${n}`, title: `Clip ${n}`, clip: n })),
  ];

  return (
    <>
      <Card title="Add a hashtag">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="#example" className={field} />
          <select value={clip} onChange={(e) => setClip(e.target.value)} className={field}>
            <option value="all">All clips</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Clip {n}
              </option>
            ))}
          </select>
          <button
            disabled={pending || !tag.trim() || platforms.length === 0}
            onClick={() =>
              run(
                () => addHashtagAction(clip === "all" ? null : Number(clip), tag, platforms),
                () => setTag(""),
              )
            }
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Add hashtag
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-700">
          {PLATFORMS.map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={platforms.includes(p)}
                onChange={(e) =>
                  setPlatforms((cur) => (e.target.checked ? [...cur, p] : cur.filter((x) => x !== p)))
                }
              />
              {LABEL[p]}
            </label>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Card>

      {groups.map((g) => {
        const rows = tags.filter((t) => t.clip === g.clip);
        return (
          <Card key={g.key} title={`${g.title} (${rows.length})`}>
            {rows.length === 0 ? (
              <p className="text-base text-stone-500">No hashtags here yet.</p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {rows.map((t) => (
                  <li key={t.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
                    <span className="text-base font-medium text-stone-900">{t.tag}</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-700">
                      {PLATFORMS.map((p) => (
                        <label key={p} className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={t[p]}
                            disabled={pending}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...enabled(t), p]
                                : enabled(t).filter((x) => x !== p);
                              run(() => setHashtagPlatformsAction(t.id, next));
                            }}
                          />
                          {LABEL[p]}
                        </label>
                      ))}
                      <button
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm(`Delete ${t.tag}?`)) run(() => deleteHashtagAction(t.id));
                        }}
                        className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-600 hover:bg-stone-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        );
      })}

      <p className="text-sm text-stone-500">
        Per post, the app picks: {PLATFORMS.map((p) => `${perPlatform[p]} for ${LABEL[p]}`).join(", ")}.
      </p>
    </>
  );
}
