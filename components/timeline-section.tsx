export function TimelineSection() {
  const timelineEvents = [
    {
      date: "1 Januari 2025",
      title: "Pembukaan Pendaftaran",
      description: "Pendaftaran resmi dibuka untuk seluruh kategori kompetisi UISO 2025",
    },
    {
      date: "15 Januari 2025",
      title: "Roadshow Dimulai",
      description: "Kunjungan ke sekolah-sekolah di berbagai kota untuk sosialisasi dan workshop",
    },
    {
      date: "28 Februari 2025",
      title: "Penutupan Pendaftaran",
      description: "Batas akhir pendaftaran untuk semua kategori kompetisi",
    },
    {
      date: "1 Maret 2025",
      title: "Grand Opening",
      description: "Pembukaan resmi UISO 2025 dengan webinar inspiratif",
    },
    {
      date: "5 Maret 2025",
      title: "Seminar Lingkungan",
      description: "Seminar khusus tentang isu lingkungan dan keberlanjutan",
    },
    {
      date: "8-9 Maret 2025",
      title: "Babak Penyisihan",
      description: "Pelaksanaan babak penyisihan untuk semua kategori kompetisi",
    },
    {
      date: "10 Maret 2025",
      title: "Campus Tour",
      description: "Tur kampus UI dan kunjungan ke laboratorium penelitian",
    },
    {
      date: "12-14 Maret 2025",
      title: "Babak Final",
      description: "Pelaksanaan babak final dan presentasi karya peserta",
    },
    {
      date: "15 Maret 2025",
      title: "Grand Closing",
      description: "Penutupan acara dan pengumuman pemenang UISO 2025",
    },
  ]

  return (
    <section id="timeline" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Timeline Acara
          </h2>
          <p className="text-lg text-gray-600">
            Jadwal lengkap rangkaian acara UISO 2025 dari pendaftaran hingga penutupan
          </p>
        </div>

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
    </section>
  )
}
