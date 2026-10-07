import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist } from "next/font/google";
import { Nav } from "./nav";
import { ThemeToggle } from "./theme-toggle";
import { Sparkle } from "./icons";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHIGLA",
  description: "Post your videos to TikTok, Instagram, YouTube and Facebook",
};

// Runs before the page paints, so a dark-mode visitor never sees a light flash.
const themeScript = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection(); // every page reads live data (Drive, the clock), so never prerender
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <span className="flex items-center gap-2 text-lg font-extrabold tracking-[0.2em] text-stone-900 dark:text-stone-100">
              <Sparkle />
              CHIGLA
            </span>
            <Nav />
            <ThemeToggle />
          </div>
        </header>
        <main className="page-enter mx-auto max-w-5xl space-y-6 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
