"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Today" },
  { href: "/schedule", label: "Schedule" },
  { href: "/accounts", label: "Accounts" },
  { href: "/test-post", label: "Send a test" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1">
      {items.map((i) => {
        const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active ? "bg-indigo-600 text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
