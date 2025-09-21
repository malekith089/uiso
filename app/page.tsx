"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { CountdownSection } from "@/components/countdown-section"
import { AboutSection } from "@/components/about-section"
import { CompetitionSection } from "@/components/competition-section"
import { EventSeriesSection } from "@/components/event-series-section"
import { TimelineSection } from "@/components/timeline-section"
import { Footer } from "@/components/footer"

export default function UisoLandingPage() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="min-h-screen">
      <Navbar />

      {showBanner && (
        <div className="fixed top-[64px] left-0 w-full bg-pink-600 text-white z-40 shadow-md">
          <div className="relative flex items-center justify-center gap-2 px-4 py-3 flex-wrap text-center">
            <a
              href="https://web.analitica.id/explore/%23p2025.uiso"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              <span className="font-semibold text-base md:text-lg">
                Tryout TKA SMA UISO
              </span>

              {/* Logo Analitica */}
              <img
                src="/images/logo-analitica.svg"
                alt="Analitica Logo"
                className="h-6 w-auto bg-white rounded p-1"
              />

              <span className="font-semibold text-base md:text-lg">x</span>

              {/* Logo TamanSchool */}
              <img
                src="/images/tamanschool.webp"
                alt="TamanSchool Logo"
                className="h-6 w-auto bg-white rounded p-1"
              />

              <span className="font-semibold text-base md:text-lg">
                – Klik di sini!
              </span>
            </a>

            {/* Close Button */}
            <button
              onClick={() => setShowBanner(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-black font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
