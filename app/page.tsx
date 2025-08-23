import { Navbar } from "@/components/navbar"
import { CountdownSection } from "@/components/countdown-section"
import { AboutSection } from "@/components/about-section"
import { CompetitionSection } from "@/components/competition-section"
import { EventSeriesSection } from "@/components/event-series-section"
import { SpeakersSection } from "@/components/speakers-section"
import { TimelineSection } from "@/components/timeline-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"

export default function UisoLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <CountdownSection />
        <AboutSection />
        <CompetitionSection />
        <EventSeriesSection />
        <SpeakersSection />
        <TimelineSection />
        <TestimonialsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  )
}
