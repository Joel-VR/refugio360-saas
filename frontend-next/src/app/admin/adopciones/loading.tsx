export default function LoadingAdopciones() {
  return (
    <main className="px-6 py-10">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-8">
        <div className="h-32 animate-pulse rounded-3xl border border-slate-custom-50 bg-cream-50" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-3xl border border-slate-custom-50 bg-cream-50" />
          ))}
        </div>
      </section>
    </main>
  );
}
