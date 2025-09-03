import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

const StartSitVisual = () => (
  <div className="relative w-full h-full overflow-hidden rounded-xl">
    <Image
      src="/images/landing-page/start_sit.png"
      alt="Start/Sit comparison preview"
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
  </div>
)

const PlayerCardVisual = () => (
  <div className="relative w-full h-full overflow-hidden rounded-xl">
    <Image
      src="/images/landing-page/player_card.png"
      alt="Player card and projections preview"
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
  </div>
)

export function AlternatingFeaturesSection() {
  const features = [
    {
      category: "START/SIT",
      title: "Compare Players With Vegas Context",
      description: [
        "Side‑by‑side projections for PPR, Half, Standard (4/6pt pass TD)",
        "Anytime TD, prop lines, game totals and spreads",
        "Highlights best projection and higher O/U automatically",
        "Team logos, headshots, and mobile‑friendly layout",
      ],
      visual: <StartSitVisual />,
      visualPosition: "right",
      cta: { href: "/nfl/start-sit", label: "Explore Start/Sit" },
    },
    {
      category: "PLAYER INSIGHTS",
      title: "Deep Player Card & Projections",
      description: [
        "Prop betting lines with inferred values when odds are missing",
        "QB Passing TDs/INTs, receptions, yards, longest plays",
        "Opponent, kickoff time, O/U and spread right in context",
        "Tabs for Trends and Game Log (coming soon)",
      ],
      visual: <PlayerCardVisual />,
      visualPosition: "left",
      cta: { href: "/nfl/rankings", label: "View Weekly Rankings" },
    },
  ] as const

  return (
    <section className="w-full py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 w-[360px] h-[360px] rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="space-y-24">
          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Content */}
              <div className={`space-y-6 ${feature.visualPosition === "left" ? "lg:order-2" : ""}`}>
                <div className="inline-block">
                  <span className="text-primary text-sm font-medium tracking-wider uppercase border border-primary/30 px-3 py-1 rounded-full">
                    {feature.category}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                  {feature.title}
                </h2>

                <ul className="space-y-4">
                  {feature.description.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-muted-foreground text-lg">
                      <span className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {"cta" in feature && feature.cta ? (
                  <Link href={feature.cta.href}>
                    <Button variant="outline" className="border-border hover:bg-muted/50 mt-8 bg-transparent">
                      {feature.cta.label}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : null}
              </div>

              {/* Visual */}
              <div className={`${feature.visualPosition === "left" ? "lg:order-1" : ""}`}>
                <div className="overflow-hidden rounded-2xl border border-white/10 h-96 md:h-[480px] relative shadow-2xl">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "rgba(15, 23, 42, 0.6)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                  <div className="relative z-10 h-full">{feature.visual}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
