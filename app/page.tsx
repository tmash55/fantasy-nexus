import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { HeroSection } from "@/components/landing-page/Hero-landing";
import { SocialProof } from "@/components/landing-page/SocialProof";
import { AnimatedSection } from "@/components/animated-section";
import { DashboardPreview } from "@/components/landing-page/dashboard-preview";
import Pricing from "@/components/Pricing";
import { TestimonialGridSection } from "@/components/landing-page/testimonial-grid";
import { FAQSection } from "@/components/landing-page/faq-section";
import { CTASection } from "@/components/landing-page/cta-section";
import { AlternatingFeaturesSection } from "@/components/landing-page/alternating-features-section";
import { LargeTestimonial } from "@/components/landing-page/large-testimonial";



export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/nfl/rankings");
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-0">
      <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative">
          <HeroSection />
          {/* Dashboard Preview Wrapper */}
          <div className="absolute bottom-[-200px] md:bottom-[-500px] left-1/2 transform -translate-x-1/2 z-30">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </main>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto px-6 mt-[254px] md:mt-[600px]" delay={0.1}>
          <SocialProof />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 w-full mt-16" delay={0.3}>
          <AlternatingFeaturesSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 w-full mt-16" delay={0.3}>
          <LargeTestimonial />
        </AnimatedSection>
        <AnimatedSection
          id="pricing-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
          delay={0.2}
        >
          <Pricing />
        </AnimatedSection>  
        
        <AnimatedSection id="faq-section" className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <FAQSection />
        </AnimatedSection>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <CTASection />
        </AnimatedSection>
       
      </div>
    </div>
  )
}


