export function SocialProof() {
    return (
      <section className="self-stretch py-16 flex flex-col justify-center items-center gap-8 overflow-hidden">
        <div className="text-center text-muted-foreground text-sm font-medium leading-tight">
          Trusted by Fantasy Players Everywhere
        </div>
  
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">10,000+</div>
            <div className="text-sm text-muted-foreground font-medium">Fantasy Players Helped</div>
          </div>
  
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">4,500+</div>
            <div className="text-sm text-muted-foreground font-medium">Early Adopters</div>
          </div>
  
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">Thousands</div>
            <div className="text-sm text-muted-foreground font-medium">Lineup Decisions Made</div>
          </div>
  
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">Vegas</div>
            <div className="text-sm text-muted-foreground font-medium">Sportsbook Powered</div>
          </div>
        </div>
  
        <div className="text-center text-muted-foreground text-xs font-normal max-w-md">
          Backed by the sharpest predictions in the industry - because sportsbooks don&apos;t lose money on bad data
        </div>
      </section>
    )
  }
  