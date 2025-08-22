export function EventSeriesSection() {
  const events = [
    {
      title: "Roadshow",
      description:
        "Kunjungan ke berbagai sekolah di seluruh Indonesia untuk memperkenalkan UISO dan memberikan workshop persiapan kompetisi.",
      image: "/placeholder.svg?height=300&width=400&text=Roadshow",
      date: "Agustus - Oktober 2025",
    },
    {
      title: "Grand Opening & Webinar",
      description: "Pembukaan resmi UISO 2025 dengan webinar inspiratif dari para ahli sains dan teknologi terkemuka.",
      image: "/placeholder.svg?height=300&width=400&text=Grand+Opening",
      date: "19 Oktober 2025",
    },
    {
      title: "Seminar Lingkungan",
      description:
        "Seminar khusus tentang isu-isu lingkungan terkini dan solusi berkelanjutan untuk masa depan yang lebih hijau.",
      image: "/placeholder.svg?height=300&width=400&text=Environmental+Seminar",
      date: "29 November 2025",
    },
    {
      title: "Campus Tour",
      description:
        "Tur eksklusif ke kampus Universitas Indonesia dengan kunjungan ke laboratorium dan fasilitas penelitian terdepan.",
      image: "/placeholder.svg?height=300&width=400&text=Campus+Tour",
      date: "29 November 2025",
    },
    {
      title: "Grand Closing & Awarding Day",
      description: "Penutupan UISO 2025 dengan pengumuman pemenang dan penyerahan hadiah kepada para juara kompetisi.",
      image: "/placeholder.svg?height=300&width=400&text=Awarding+Day",
      date: "30 November",
    },
  ]

  return (
    <section id="rangkaian-acara" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Rangkaian Acara UISO
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Serangkaian acara menarik yang dirancang untuk memberikan pengalaman komprehensif kepada seluruh peserta
          </p>
        </div>

        <div className="space-y-16">
          {events.map((event, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8 lg:gap-12`}
            >
              <div className="flex-1">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
              </div>
              <div className="flex-1 space-y-6">
                <div className="inline-block bg-gradient-to-r from-accent/20 to-accent-light/20 text-primary px-4 py-2 rounded-full text-sm font-medium border border-accent/30">
                  {event.date}
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {event.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
