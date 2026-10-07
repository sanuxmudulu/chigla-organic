"use client";

// Pill switch with the sun on the left (light) and the moon on the right (dark). Both icons stay
// visible. The active one is yellow and sits on a small highlight circle; the other is grey.
// The dark class is set on <html>; the look is picked with CSS (dark:), so server and browser
// render the same HTML and nothing flickers.
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Private mode or blocked storage: the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      title="Switch between light and dark mode"
      className="ml-auto flex h-9 w-[72px] shrink-0 items-center rounded-full border border-stone-300 bg-stone-100 p-1 transition-colors dark:border-stone-700 dark:bg-stone-800"
    >
      <span className="flex h-7 w-1/2 items-center justify-center rounded-full bg-white shadow-sm transition-colors dark:bg-transparent dark:shadow-none">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-amber-400 dark:text-stone-500" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" />
        </svg>
      </span>
      <span className="flex h-7 w-1/2 items-center justify-center rounded-full bg-transparent transition-colors dark:bg-stone-900 dark:shadow-sm">
        <svg viewBox="0 0 24 24" width="16" height="16" strokeWidth="2" strokeLinejoin="round" className="text-stone-400 dark:text-white dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" stroke="currentColor" />
        </svg>
      </span>
    </button>
  );
}
