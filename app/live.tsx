"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

function subscribe(onTick: () => void) {
  const t = setInterval(onTick, TICK_MS);
  return () => clearInterval(t);
}

// Current time, refreshed every 30 seconds. Null on the server and on the first render,
// so the HTML the server sends matches what the browser builds before it starts ticking.
export function useNow(): number | null {
  const bucket = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK_MS),
    () => null,
  );
  return bucket === null ? null : bucket * TICK_MS;
}

// "2h 14m" until the target time, or "now" once it has passed.
export function Countdown({ target }: { target: string }) {
  const now = useNow();
  if (now === null) return <span>…</span>;
  const ms = Date.parse(target) - now;
  if (ms <= 0) return <span>now</span>;
  const mins = Math.ceil(ms / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return <span>{h > 0 ? `${h}h ${m}m` : `${m}m`}</span>;
}
