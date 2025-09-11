import config from "@/config"
import ButtonCheckout from "./ButtonCheckout"
import { Lock, CheckCircle2, XCircle, Quote, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SeasonCountdown from "@/components/SeasonCountdown"

const Pricing = () => {
  const pro = config.stripe.plans.find((p: any) => !p.isSeasonPass) ?? config.stripe.plans[0]
  const season = config.stripe.plans.find((p: any) => (p as any).isSeasonPass)

  const freeFeatures = [
    { label: "Top 5 players per position", ok: true },
    { label: "Limited game insights", ok: true },
    { label: "Custom scoring filters", ok: false },
    { label: "Full weekly rankings", ok: false },
    { label: "1 Start/Sit comparison per week", ok: false },
  ]

  const proFeatures = [
    { label: "Full weekly rankings for every position", ok: true, strong: true },
    { label: "Custom scoring (PPR, 4/6pt passing TD)", ok: true },
    { label: "Unlimited Start/Sit comparisons", ok: true, strong: true },
    { label: "Vegas-powered insights and prop lines", ok: true },
    { label: "Priority support", ok: true },
  ]

  return (
    <section className="overflow-hidden relative" id="pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

      <div className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold backdrop-blur-sm border border-primary/20">
            <Trophy className="h-3.5 w-3.5" /> Premium Tools
          </div>
          <h1 className="mt-4 font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-balance">
            Win your league with Vegas‑powered insights
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground text-pretty">
            Don&apos;t lose Week 1 on a bad lineup decision. Upgrade today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Free */}
          <div className="relative rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col shadow-sm order-3 lg:order-none">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Free</h3>
              <p className="text-muted-foreground mt-2 text-sm">Try the core experience</p>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
            <ul className="space-y-3 text-sm flex-1">
              {freeFeatures.map((f) => (
                <li key={f.label} className="flex items-start gap-3">
                  {f.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={f.ok ? "text-foreground" : "text-muted-foreground"}>{f.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/sign-up">
                <Button variant="outline" className="w-full h-11 bg-transparent">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Season Pass (Middle - highlighted) */}
          <div className="relative order-1 lg:order-none lg:col-span-1 rounded-xl border border-primary/40 bg-gradient-to-b from-primary/15 via-primary/5 to-background/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col shadow-lg ring-1 ring-primary/20">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full font-semibold shadow-sm">
              Best Value – Launch Offer 🔥
            </div>
            <div className="mb-6 pt-2">
              <h3 className="text-xl font-bold">{season?.name || "Season Pass"}</h3>
              <p className="text-muted-foreground mt-2 text-sm">One-time, valid through Super Bowl</p>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-extrabold">${season?.price || 24.99}</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
            <ul className="space-y-3 text-sm flex-1">
              {[
                "Full weekly rankings",
                "Custom scoring filters",
                "Unlimited Start/Sit",
                "Vegas-powered insights & prop lines",
                "Priority support",
              ].map((label) => (
                <li key={label} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span
                    className={
                      label.includes("Full weekly") || label.includes("Unlimited")
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    }
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-3">
              {season?.priceId ? (
                <ButtonCheckout
                  priceId={season.priceId}
                  label={`Get Season Pass – $${season.price || 24.99}`}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-11 font-semibold shadow-sm"
                />
              ) : null}
              <SeasonCountdown
                deadline={new Date("2025-10-01T17:00:00Z")}
                className="flex items-center justify-center"
              />
              <p className="text-center text-xs text-muted-foreground">Offer Ends October 1st (after Week 4)</p>
              <p className="w-full flex items-center justify-center text-xs text-muted-foreground gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Secure Stripe Checkout
              </p>
            </div>
          </div>

          {/* Monthly Pro (right) */}
          <div className="relative rounded-xl border border-primary/30 bg-gradient-to-b from-primary/10 via-primary/5 to-background/80 backdrop-blur-sm p-6 sm:p-8 flex flex-col shadow-sm ring-1 ring-primary/10 order-2 lg:order-none">
            <div className="absolute -top-3 right-4 text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold shadow-sm">
              Most Popular
            </div>
            <div className="mb-6 pt-2">
              <div className="text-[11px] uppercase tracking-wide text-primary font-semibold mb-2 flex items-center gap-1">
                🔥 Best Value for Fantasy Players
              </div>
              <h3 className="text-xl font-bold">{pro.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm">Everything unlocked • Cancel anytime</p>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-extrabold">${pro.price}</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
            <ul className="space-y-3 text-sm flex-1">
              {proFeatures.map((f) => (
                <li key={f.label} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className={f.strong ? "font-semibold text-foreground" : "text-foreground"}>{f.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-3">
              <ButtonCheckout
                priceId={pro.priceId}
                mode="subscription"
                label={`Get Premium Monthly – $${pro.price}`}
                className="h-11 font-semibold"
              />
              <p className="text-center text-xs text-muted-foreground">Cancel anytime, instant access.</p>
              <p className="w-full flex items-center justify-center text-xs text-muted-foreground gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Secure Stripe Checkout
              </p>
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="text-base sm:text-lg text-muted-foreground mb-4">
            Over <span className="font-extrabold text-foreground text-2xl sm:text-3xl">10,000+</span> fantasy players
            have used our tools.
          </div>
          <div className="max-w-2xl mx-auto p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
            <Quote className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="italic text-sm text-foreground/90">
              &quot;These projections are sharper than anything else I&apos;ve used.&quot;
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Trusted Creator</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
