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

        {/* Promo Banner */}
<div className="fixed top-[64px] left-0 w-full bg-pink-600 text-white z-40 shadow-md">
  <a
    href="https://web.analitica.id/explore/%23p2025.uiso"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 px-4 py-3 flex-wrap text-center"
  >
    <span className="font-semibold text-base md:text-lg">
      Tryout TKA SMA UISO
    </span>

    {/* Logo Analitica */}
    <img
      src="images/logo-analitica.svg"
      alt="Analitica Logo"
      className="h-6 w-auto bg-white rounded p-1"
    />

    <span className="font-semibold text-base md:text-lg">x</span>

    {/* Logo TamanSchool */}
    <img
      src="images/tamanschool.png"
      alt="TamanSchool Logo"
      className="h-6 w-auto bg-white rounded p-1"
    />

    <span className="font-semibold text-base md:text-lg">
      – Klik di sini!
    </span>
  </a>
</div>


      <main>
        <CountdownSection />
        <AboutSection />
        <CompetitionSection />
        <EventSeriesSection />
        {/* <SpeakersSection /> */}
        <TimelineSection />
        {/* <TestimonialsSection />
        <PartnersSection /> */}
      </main>
      <Footer />
    </div>
  )
}
