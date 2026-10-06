import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist } from "next/font/google";
import { Nav } from "./nav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chigla Organic",
  description: "Post your videos to TikTok, Instagram, YouTube and Facebook",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection(); // every page reads live data (Drive, the clock), so never prerender
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <span className="text-lg font-semibold tracking-tight text-stone-900">Chigla Organic</span>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
