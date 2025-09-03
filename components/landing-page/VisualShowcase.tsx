"use client"
export default function VisualShowcase() {
  return (
    <section className="relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-xl border border-border bg-gradient-to-b from-background to-muted/20 overflow-hidden shadow-sm">
            {/* Decorative lock overlays */}
            <div className="pointer-events-none absolute top-4 right-4 text-[10px] px-2 py-1 rounded-full bg-orange-500/15 text-orange-600 border border-orange-500/30">Locked Preview</div>
            <div className="pointer-events-none absolute bottom-4 left-4 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Rankings Demo</div>

            {/* Showcase image (fallback to placeholder panel if missing) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/landing/rankings-showcase.png"
              alt="Fantasy Nexus rankings table preview"
              className="w-full h-auto block"
              onError={(e) => {
                const el = e.currentTarget
                el.style.display = 'none'
                const fallback = el.nextElementSibling as HTMLDivElement | null
                if (fallback) fallback.style.display = 'block'
              }}
            />
            <div className="hidden w-full aspect-[16/9] bg-gradient-to-br from-muted/40 to-muted/10 flex items-center justify-center text-sm text-muted-foreground">
              Rankings preview
            </div>
          </div>

          <p className="text-center text-sm sm:text-base text-muted-foreground mt-4">
            See your players’ projections, start/sit recommendations, and matchup insights — all powered by Vegas.
          </p>
        </div>
      </div>
    </section>
  )
}


