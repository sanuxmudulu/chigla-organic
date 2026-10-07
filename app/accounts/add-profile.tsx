"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddProfile() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Could not create the profile.");
      setName("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. profile6"
          className="min-w-0 flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-base outline-none focus:border-indigo-500"
        />
        <button
          onClick={add}
          disabled={busy || !name.trim()}
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {busy ? "Adding..." : "Add profile"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
