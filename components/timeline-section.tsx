export function TimelineSection() {
  const timelineEvents = [
    {
      date: "14 Agustus – 16 Oktober 2025",
      title: "Roadshow",
      description: "Roadshow UI Science Olympiad 2025",
    },
    {
      date: "23 Agustus 2025",
      title: "Pembukaan Pendaftaran",
      description: "Pembukaan resmi pendaftaran UI Science Olympiad 2025.",
    },
    {
      date: "17 Oktober 2025",
      title: "Penutupan Pendaftaran",
      description: "Batas akhir pendaftaran UI Science Olympiad 2025.",
    },
    {
      date: "19 Oktober 2025",
      title: "Grand Opening & Technical Meeting 1",
      description: "Grand Opening UI Science Olympiad 2025 dan Technical Meeting 1.",
    },
    {
      date: "20 Oktober 2025",
      title: "Open Submission",
      description: "Pembukaan pengumpulan karya untuk Study Case Competition dan Esai Gagasan Kritis.",
    },
    {
      date: "3 November 2025",
      title: "Close Submission",
      description: "Penutupan pengumpulan karya untuk Study Case Competition dan Esai Gagasan Kritis.",
    },
    {
      date: "9 November 2025",
      title: "Babak Penyisihan",
      description: "Pelaksanaan Babak Penyisihan Olimpiade Sains Pelajar.",
    },
    {
      date: "15 November 2025",
      title: "Pengumuman Peserta Lolos",
      description:
        "Pengumuman peserta yang lolos seleksi Olimpiade Sains Pelajar, Study Case Competition, dan Esai Gagasan Kritis.",
    },
    {
      date: "21 November 2025",
      title: "Technical Meeting 2",
      description: "Technical Meeting 2 UI Science Olympiad 2025.",
    },
    {
      date: "23 November 2025",
      title: "Babak Final Study Case & Esai",
      description: "Pelaksanaan Babak Final Study Case Competition dan Esai Gagasan Kritis.",
    },
    {
      date: "28 November 2025",
      title: "Babak Final Olimpiade",
      description: "Pelaksanaan Babak Final Olimpiade Sains Pelajar.",
    },
    {
      date: "29 November 2025",
      title: "Seminar & Campus Tour",
      description: "Seminar Lingkungan dan Campus Tour UI Science Olympiad 2025.",
    },
    {
      date: "30 November 2025",
      title: "Grand Closing & Awarding Day",
      description: "Penutupan resmi dan pemberian penghargaan UI Science Olympiad 2025.",
    },
  ]

  return (
    <section id="timeline" className="py-20 bg-gradient-to-b from-accent/5 to-primary-dark/20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 font-heading tracking-heading leading-normal">
            Timeline Acara
          </h2>
          <p className="text-lg text-gray-600">
            Jadwal lengkap rangkaian acara UISO 2025 dari pendaftaran hingga penutupan
          </p>
        </div>

        {/* Mobile Timeline */}
        <div className="block md:hidden max-w-sm mx-auto">
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-secondary transform -translate-x-1/2"></div>

            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex justify-center">
                  <div className="bg-white border-l-4 border-primary rounded-xl shadow-lg p-6 w-full max-w-xs text-center hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {event.title}
                    </h3>
                    <p className="text-accent font-bold text-sm mb-2">{event.date}</p>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-accent to-secondary"></div>

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary hover:shadow-xl transition-shadow duration-300">
                      <div className="text-accent font-bold text-sm mb-2">{event.date}</div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                        {event.title}
                      </h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-gradient-to-br from-primary to-accent rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
