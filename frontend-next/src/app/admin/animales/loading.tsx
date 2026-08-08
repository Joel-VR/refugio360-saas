export default function LoadingAnimales() {
  return (
    <main className="px-6 py-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="h-28 animate-pulse rounded-3xl border border-slate-custom-50 bg-cream-50" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      </section>
    </main>
  );
}
