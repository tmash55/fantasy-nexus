export function LargeTestimonial() {
    return (
      <section className="w-full px-5 overflow-hidden flex justify-center items-center">
        <div className="flex-1 flex flex-col justify-start items-start overflow-hidden">
          <div className="self-stretch px-4 py-12 md:px-6 md:py-16 lg:py-28 flex flex-col justify-start items-start gap-2">
            <div className="self-stretch flex justify-between items-center">
              <div className="flex-1 px-4 py-8 md:px-12 lg:px-20 md:py-8 lg:py-10 overflow-hidden rounded-lg flex flex-col justify-center items-center gap-6 md:gap-8 lg:gap-11">
                <div className="w-full max-w-[1024px] text-center text-foreground leading-7 md:leading-10 lg:leading-[64px] font-medium text-lg md:text-3xl lg:text-6xl">
                  &quot;I&apos;ve always ignored the consensus rankings — they burned me too many times. Vegas odds gave me the edge
                  I needed to finally take my league.&quot;
                </div>
                <div className="flex justify-start items-center gap-5">
                  <div className="w-12 h-12 relative rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-lg">DR</span>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <div className="text-foreground text-base font-medium leading-6">David R.</div>
                    <div className="text-muted-foreground text-sm font-normal leading-6">{"Fantasy Player, 8 Years"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
  