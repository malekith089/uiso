"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"

const CompetitionSection = memo(function CompetitionSection() {
  const [activeTab, setActiveTab] = useState("OSP")

  const competitions = {
    OSP: {
      title: "Olimpiade Sains Pelajar",
      description:
        "Kompetisi yang menguji kemampuan siswa dalam bidang sains dasar meliputi Matematika, Fisika, Kimia, dan Biologi. Peserta akan menghadapi soal-soal yang menantang dan membutuhkan pemahaman konsep yang mendalam.",
      details: ["Kategori: SMA/MA sederajat", "Jenis Lomba: Individu"],
      image: "/placeholder.svg?height=400&width=600&text=OSP+Competition",
    },
    SCC: {
      title: "Study Case Competition",
      description:
        "Kompetisi kreativitas sains yang mengajak peserta untuk menciptakan inovasi dan solusi kreatif terhadap permasalahan sehari-hari menggunakan pendekatan ilmiah dan teknologi terkini.",
      details: ["Kategori: Perguruan Tinggi/Sederajat", "Jenis Lomba: Tim (2-3 orang)"],
      image: "/placeholder.svg?height=400&width=600&text=SCC+Competition",
    },
    EGK: {
      title: "Esai Gagasan Kreatif",
      description:
        "Kompetisi yang fokus pada pengetahuan lingkungan dan keberlanjutan. Peserta akan diuji tentang pemahaman mereka terhadap isu-isu lingkungan global dan solusi ramah lingkungan.",
      details: ["Kategori: Perguruan Tinggi/Sederajat", "Jenis Lomba: Individu"],
      image: "/placeholder.svg?height=400&width=600&text=EGK+Competition",
    },
  }

  return (
    <section id="lomba" className="py-20 bg-gradient-to-br from-primary/5 via-tertiary/5 to-accent/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Kompetisi Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tiga kategori kompetisi yang dirancang untuk menguji berbagai aspek kemampuan sains dan kreativitas peserta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tab Buttons */}
          <div className="lg:col-span-1">
            <div className="space-y-1">
              {Object.keys(competitions).map((key) => (
                <Button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  variant={activeTab === key ? "default" : "outline"}
                  className={`w-full justify-start text-left p-6 h-auto transition-all duration-300 ${
                    activeTab === key
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
                      : "bg-white hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 text-primary border-primary/20"
                  }`}
                >
                  <div>
                    <div className="font-bold text-lg mb-1">{key}</div>
                    <div className="text-sm opacity-80">{competitions[key].title}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                  {competitions[activeTab].title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{competitions[activeTab].description}</p>
                <div className="space-y-3">
                  {competitions[activeTab].details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export { CompetitionSection }
