"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SpeakersSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const speakers = [
    {
      name: "Prof. Dr. Bambang Suryoatmono",
      title: "Ahli Fisika Teoretis UI",
      bio: "Pakar dalam bidang fisika kuantum dan teknologi nano dengan pengalaman penelitian lebih dari 20 tahun.",
      image: "/placeholder.svg?height=300&width=300&text=Prof+Bambang",
      topic: "Fisika Kuantum untuk Masa Depan",
    },
    {
      name: "Dr. Sari Wahyuni, M.Si",
      title: "Peneliti Biologi Molekuler",
      bio: "Spesialis dalam penelitian genetika dan bioteknologi dengan fokus pada aplikasi medis.",
      image: "/placeholder.svg?height=300&width=300&text=Dr+Sari",
      topic: "Bioteknologi dalam Kedokteran Modern",
    },
    {
      name: "Prof. Dr. Ahmad Hidayat",
      title: "Pakar Kimia Lingkungan",
      bio: "Ahli dalam kimia lingkungan dan teknologi hijau untuk solusi berkelanjutan.",
      image: "/placeholder.svg?height=300&width=300&text=Prof+Ahmad",
      topic: "Kimia Hijau untuk Lingkungan Berkelanjutan",
    },
    {
      name: "Dr. Maya Indrawati, Ph.D",
      title: "Matematikawan Terapan",
      bio: "Spesialis dalam matematika terapan dan pemodelan matematika untuk industri.",
      image: "/placeholder.svg?height=300&width=300&text=Dr+Maya",
      topic: "Matematika dalam Era Digital",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % speakers.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + speakers.length) % speakers.length)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-tertiary/10 via-primary/5 to-accent/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Pembicara Acara
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Belajar dari para ahli terbaik di bidangnya yang akan berbagi pengetahuan dan pengalaman
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {speakers.map((speaker, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            {speaker.name}
                          </h3>
                          <p className="text-lg text-accent font-medium mb-4">{speaker.title}</p>
                          <p className="text-gray-600 mb-6 leading-relaxed">{speaker.bio}</p>
                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                            <p className="text-primary font-medium">Topik: {speaker.topic}</p>
                          </div>
                        </div>
                        <div className="relative h-64 md:h-auto">
                          <img
                            src={speaker.image || "/placeholder.svg"}
                            alt={speaker.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-8 gap-2">
            {speakers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
