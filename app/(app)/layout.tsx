import { connection } from "next/server";
import { Nav } from "./nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await connection(); // pages read live data (Drive), so never prerender them
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-4 border-b border-zinc-200 p-4 md:w-56 md:border-r md:border-b-0 dark:border-zinc-800">
        <div className="px-3 text-sm font-semibold tracking-tight">Chigla Organic</div>
        <Nav />
        <form method="post" action="/api/logout">
          <button className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
