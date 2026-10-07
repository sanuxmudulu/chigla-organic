"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Hashtag } from "@/lib/content";
import { addHashtagAction, deleteHashtagAction, setHashtagActiveAction } from "../actions";
import { Card } from "../ui";

const field = "min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-base outline-none focus:border-indigo-500";

export function HashtagsCard({ tags }: { tags: Hashtag[] }) {
  const router = useRouter();
  const [tag, setTag] = useState("");
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

  return (
    <Card title={`Hashtags · ${tags.filter((t) => t.active).length} on`}>
      <div className="flex gap-2">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tag.trim() && run(() => addHashtagAction(tag), () => setTag(""))}
          placeholder="#example"
          className={field}
        />
        <button
          disabled={pending || !tag.trim()}
          onClick={() => run(() => addHashtagAction(tag), () => setTag(""))}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <li key={t.id} className="group">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                t.active
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
                  : "border-stone-300 text-stone-400 line-through"
              }`}
            >
              <button
                disabled={pending}
                onClick={() => run(() => setHashtagActiveAction(t.id, !t.active))}
                className="hover:underline"
                title={t.active ? "Click to pause this tag" : "Click to turn this tag back on"}
              >
                {t.tag}
              </button>
              <button
                disabled={pending}
                onClick={() => window.confirm(`Delete ${t.tag}?`) && run(() => deleteHashtagAction(t.id))}
                className="text-stone-400 hover:text-red-600"
                aria-label={`Delete ${t.tag}`}
              >
                ✕
              </button>
            </span>
          </li>
        ))}
        {tags.length === 0 && <li className="text-base text-stone-500">No hashtags yet.</li>}
      </ul>
    </Card>
  );
}
