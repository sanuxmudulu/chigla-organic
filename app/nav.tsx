"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ICONS } from "./icons";

const items = [
  { href: "/", label: "Home", icon: ICONS.home },
  { href: "/accounts", label: "Accounts", icon: ICONS.people },
  { href: "/text", label: "Text", icon: ICONS.text },
  { href: "/settings", label: "Settings", icon: ICONS.gear },
  { href: "/test-post", label: "Send a test", icon: ICONS.send },
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
            className={`nav-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
              active
                ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            {i.icon}
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
