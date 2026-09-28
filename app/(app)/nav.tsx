"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Overview" },
  { href: "/content", label: "Content" },
  { href: "/schedule", label: "Schedule" },
  { href: "/captions", label: "Captions & hashtags" },
  { href: "/accounts", label: "Accounts" },
  { href: "/test", label: "Test post" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((i) => {
        const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`rounded-md px-3 py-2 text-sm ${
              active
                ? "bg-indigo-600 text-white"
                : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
