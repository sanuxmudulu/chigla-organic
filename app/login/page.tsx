export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        method="post"
        action="/api/login"
        className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h1 className="text-xl font-semibold">Chigla Organic</h1>
        <p className="text-sm text-zinc-500">Enter your dashboard password.</p>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          placeholder="Password"
        />
        {error && <p className="text-sm text-red-500">Wrong password.</p>}
        <button className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Sign in
        </button>
      </form>
    </main>
  );
}
