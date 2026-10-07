export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header>
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{title}</h1>
      {sub && <p className="mt-2 text-base text-stone-500">{sub}</p>}
    </header>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-6 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">{title}</h2>}
      {children}
    </section>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{children}</div>;
}

export function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {children}
    </span>
  );
}
