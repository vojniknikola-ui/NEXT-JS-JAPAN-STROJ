import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductDetailLoadingScreen() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0b0b] text-neutral-100">
      <div className="relative border-b border-white/5 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,0,0.16),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,107,0,0.08),_transparent_32%)]" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 sm:py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff6b00]/80">
              JapanStroj
            </p>
            <h1 className="mt-2 text-xl font-bold text-white sm:text-2xl">
              Učitavanje detalja proizvoda
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-[#ff6b00]/20 bg-white/5 px-4 py-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-neutral-300">Pripremamo sadržaj</span>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6b00]/30 to-transparent sm:inset-x-6" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <section className="space-y-4">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#141414] shadow-[0_25px_80px_-35px_rgba(0,0,0,0.85)]">
              <div className="aspect-[1.08/1] animate-pulse bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,107,0,0.12),_transparent_52%)]" />
            </div>

            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 w-20 flex-shrink-0 animate-pulse rounded-2xl border border-white/8 bg-[#171717]"
                />
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-[#ff6b00]/30" />
              <div className="h-10 w-4/5 animate-pulse rounded-2xl bg-white/8" />
              <div className="h-5 w-2/5 animate-pulse rounded-full bg-white/8" />
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-[#121212] p-5 shadow-[0_20px_70px_-35px_rgba(255,107,0,0.4)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-7 w-36 animate-pulse rounded-full bg-white/8" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-[#ff6b00]/25" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-3/5 animate-pulse rounded-full bg-white/8" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
                <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              </div>

              <div className="mt-6 h-14 w-full animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(255,107,0,0.6),rgba(255,140,51,0.45))]" />
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-[#101010] p-5 sm:p-6">
              <div className="mb-4 h-5 w-44 animate-pulse rounded-full bg-white/8" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-white/6" />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
